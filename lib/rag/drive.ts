import { createHash } from "node:crypto";
import { extractText } from "./loader";
import type { DocumentSource, SourceEntry } from "./source";

const FOLDER = "application/vnd.google-apps.folder";
const GOOGLE_DOC = "application/vnd.google-apps.document";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PDF = "application/pdf";
const API = "https://www.googleapis.com/drive/v3";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  md5Checksum?: string;
  modifiedTime?: string;
}

/** Текстовые документы из папки Google Drive. Доступ по OAuth refresh token (только чтение). */
export class GoogleDriveSource implements DocumentSource {
  readonly kind = "google-drive" as const;
  private readonly mimeById = new Map<string, string>();
  private readonly nameById = new Map<string, string>();
  private accessToken: { value: string; expiresAt: number } | null = null;

  constructor(
    private readonly folderId: string,
    private readonly creds: { clientId: string; clientSecret: string; refreshToken: string },
  ) {}

  async list(): Promise<SourceEntry[]> {
    const entries: SourceEntry[] = [];
    await this.walk(this.folderId, "", entries);
    return entries.sort((a, b) => a.id.localeCompare(b.id));
  }

  async readText(entry: SourceEntry): Promise<string> {
    const mime = this.mimeById.get(entry.id) ?? "";
    const name = this.nameById.get(entry.id) ?? entry.name;
    if (mime === GOOGLE_DOC) {
      const res = await this.request(`${API}/files/${entry.id}/export?mimeType=text/plain`);
      return res.text();
    }
    const ext = name.toLowerCase().match(/\.(md|txt|docx|pdf)$/)?.[0] ?? "";
    const res = await this.request(`${API}/files/${entry.id}?alt=media&supportsAllDrives=true`);
    if (ext === ".md" || ext === ".txt") return res.text();
    if (ext === ".docx" || ext === ".pdf") return extractText(Buffer.from(await res.arrayBuffer()), ext);
    throw new Error(`Неподдерживаемый формат: ${name}`);
  }

  private async walk(folderId: string, prefix: string, out: SourceEntry[]): Promise<void> {
    let pageToken: string | undefined;
    do {
      const params = new URLSearchParams({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "nextPageToken,files(id,name,mimeType,md5Checksum,modifiedTime)",
        pageSize: "1000",
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
      });
      if (pageToken) params.set("pageToken", pageToken);
      const res = await this.request(`${API}/files?${params}`);
      const data = (await res.json()) as { files?: DriveFile[]; nextPageToken?: string };

      for (const f of data.files ?? []) {
        const rel = prefix + f.name;
        if (f.mimeType === FOLDER) {
          await this.walk(f.id, rel + "/", out);
          continue;
        }
        if (!isSupported(f.mimeType, f.name)) continue;
        this.mimeById.set(f.id, f.mimeType);
        this.nameById.set(f.id, f.name);
        // Для Google Docs md5 нет, поэтому хэш строится по времени изменения.
        const hash =
          f.md5Checksum ??
          createHash("sha256").update(`${f.id}|${f.modifiedTime ?? ""}`).digest("hex");
        out.push({ id: f.id, name: rel, hash });
      }
      pageToken = data.nextPageToken;
    } while (pageToken);
  }

  private async request(url: string): Promise<Response> {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${await this.getAccessToken()}` },
    });
    if (!res.ok) {
      throw new Error(`Google Drive ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    return res;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.accessToken.expiresAt > Date.now() + 60_000) {
      return this.accessToken.value;
    }
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.creds.clientId,
        client_secret: this.creds.clientSecret,
        refresh_token: this.creds.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const data = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string };
    if (!data.access_token) {
      throw new Error(`Не удалось обновить токен Google: ${data.error_description ?? res.status}`);
    }
    this.accessToken = {
      value: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
    return data.access_token;
  }
}

function isSupported(mime: string, name: string): boolean {
  if (mime === GOOGLE_DOC || mime === DOCX || mime === PDF) return true;
  return /\.(md|txt)$/i.test(name);
}
