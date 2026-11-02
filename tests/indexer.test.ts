import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Embedder } from "@/lib/rag/embed";
import { syncSource } from "@/lib/rag/indexer";
import { LocalFolderSource } from "@/lib/rag/loader";
import { emptyIndex, search } from "@/lib/rag/store";

/** Детерминированный «эмбеддер»: частоты букв. Хватает, чтобы проверить индексер без модели. */
const ALPHABET = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
let embedCalls = 0;
const fakeEmbed: Embedder = async (texts) => {
  embedCalls += texts.length;
  return texts.map((t) => {
    const lower = t.toLowerCase();
    return [...ALPHABET].map((ch) => lower.split(ch).length - 1);
  });
};

const chunking = { size: 300, overlap: 50 };
let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "rag-docs-"));
  embedCalls = 0;
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("syncSource с локальной папкой", () => {
  it("пустая папка даёт пустой индекс", async () => {
    const { index, report } = await syncSource(emptyIndex("m"), new LocalFolderSource(dir), fakeEmbed, chunking);
    expect(index.docs).toEqual([]);
    expect(report.added).toEqual([]);
  });

  it("индексирует поддерживаемые файлы и пропускает остальные", async () => {
    await writeFile(path.join(dir, "prices.md"), "Стоимость курса веб-разработки указана в прайсе.");
    await mkdir(path.join(dir, "schedule"));
    await writeFile(path.join(dir, "schedule", "groups.txt"), "Группа стартует в понедельник.");
    await writeFile(path.join(dir, "photo.png"), "not a document");

    const { index, report } = await syncSource(emptyIndex("m"), new LocalFolderSource(dir), fakeEmbed, chunking);
    expect(report.added.sort()).toEqual(["prices.md", "schedule/groups.txt"]);
    expect(index.docs.map((d) => d.name).sort()).toEqual(["prices.md", "schedule/groups.txt"]);
    expect(index.chunks.every((c) => c.vector.length === ALPHABET.length)).toBe(true);
  });

  it("не пересчитывает неизменённые файлы, обновляет изменённые и удаляет пропавшие", async () => {
    const source = new LocalFolderSource(dir);
    await writeFile(path.join(dir, "a.md"), "Первый документ.");
    await writeFile(path.join(dir, "b.md"), "Второй документ.");
    const first = await syncSource(emptyIndex("m"), source, fakeEmbed, chunking);

    embedCalls = 0;
    const second = await syncSource(first.index, source, fakeEmbed, chunking);
    expect(second.report.unchanged).toBe(2);
    expect(embedCalls).toBe(0);

    await writeFile(path.join(dir, "a.md"), "Первый документ, новая редакция.");
    await rm(path.join(dir, "b.md"));
    const third = await syncSource(second.index, source, fakeEmbed, chunking);
    expect(third.report.updated).toEqual(["a.md"]);
    expect(third.report.removed).toEqual(["b.md"]);
    expect(third.index.chunks.map((c) => c.docId)).toEqual(["a.md"]);
    expect(third.index.chunks[0].text).toContain("новая редакция");
  });

  it("находит нужный документ по вопросу", async () => {
    await writeFile(path.join(dir, "design.md"), "Дизайн интерфейсов в фигме: прототипы, макеты, исследования.");
    await writeFile(path.join(dir, "sql.md"), "Аналитика: запросы, таблицы, отчёты, сводные данные.");
    const { index } = await syncSource(emptyIndex("m"), new LocalFolderSource(dir), fakeEmbed, chunking);

    const [query] = await fakeEmbed(["дизайн макеты прототипы фигма"], "query");
    expect(search(index, query, 1)[0].chunk.docName).toBe("design.md");
  });

  it("сообщает о файле, который не удалось прочитать, и продолжает", async () => {
    await writeFile(path.join(dir, "ok.md"), "Нормальный файл.");
    await writeFile(path.join(dir, "broken.pdf"), "это не pdf");
    const { index, report } = await syncSource(emptyIndex("m"), new LocalFolderSource(dir), fakeEmbed, chunking);
    expect(report.failed.map((f) => f.name)).toEqual(["broken.pdf"]);
    expect(index.docs.map((d) => d.name)).toEqual(["ok.md"]);
  });

  it("не трогает документы других источников", async () => {
    const foreign = { ...emptyIndex("m"), docs: [{ id: "drive-1", name: "Drive.docx", hash: "x", source: "google-drive", chunkCount: 1, indexedAt: "" }], chunks: [{ id: "drive-1#0", docId: "drive-1", docName: "Drive.docx", text: "t", vector: [1] }] };
    const { index } = await syncSource(foreign, new LocalFolderSource(dir), fakeEmbed, chunking);
    expect(index.docs.map((d) => d.id)).toEqual(["drive-1"]);
    expect(index.chunks.map((c) => c.id)).toEqual(["drive-1#0"]);
  });
});
