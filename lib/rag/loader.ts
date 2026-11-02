import { createHash } from "node:crypto";
import { readdir, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { SUPPORTED_EXTENSIONS } from "./config";
import type { DocumentSource, SourceEntry } from "./source";

export async function extractText(buffer: Buffer, ext: string): Promise<string> {
  switch (ext) {
    case ".md":
    case ".txt":
      return buffer.toString("utf8");
    case ".pdf": {
      const { extractText: extractPdf, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractPdf(pdf, { mergePages: true });
      return text;
    }
    case ".docx": {
      const mammoth = await import("mammoth");
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    }
    default:
      throw new Error(`Неподдерживаемый формат: ${ext}`);
  }
}

function isSupported(file: string): boolean {
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(path.extname(file).toLowerCase());
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile() && isSupported(entry.name)) files.push(full);
  }
  return files;
}

export class LocalFolderSource implements DocumentSource {
  readonly kind = "local" as const;

  constructor(private readonly dir: string) {}

  async list(): Promise<SourceEntry[]> {
    await mkdir(this.dir, { recursive: true });
    const files = await walk(this.dir);
    const entries = await Promise.all(
      files.map(async (file) => {
        const rel = path.relative(this.dir, file).split(path.sep).join("/");
        const hash = createHash("sha256").update(await readFile(file)).digest("hex");
        return { id: rel, name: rel, hash };
      }),
    );
    return entries.sort((a, b) => a.id.localeCompare(b.id));
  }

  async readText(entry: SourceEntry): Promise<string> {
    const file = path.join(this.dir, entry.id);
    return extractText(await readFile(file), path.extname(file).toLowerCase());
  }
}
