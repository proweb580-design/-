import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { emptyIndex, loadIndex, saveIndex, search, type RagIndex } from "@/lib/rag/store";

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "rag-store-"));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const chunk = (id: string, vector: number[]) => ({ id, docId: "d", docName: "d.md", text: id, vector });

describe("store", () => {
  it("возвращает пустой индекс, если файла нет", async () => {
    expect(await loadIndex(path.join(dir, "none.json"), "m")).toEqual(emptyIndex("m"));
  });

  it("сохраняет и читает индекс", async () => {
    const file = path.join(dir, "data", "index.json");
    const index: RagIndex = { ...emptyIndex("m"), chunks: [chunk("a", [1, 0])] };
    await saveIndex(file, index);
    expect(await loadIndex(file, "m")).toEqual(index);
  });

  it("сбрасывает индекс, построенный другой моделью", async () => {
    const file = path.join(dir, "index.json");
    await writeFile(file, JSON.stringify({ ...emptyIndex("old"), chunks: [chunk("a", [1])] }));
    expect(await loadIndex(file, "new")).toEqual(emptyIndex("new"));
  });

  it("ранжирует фрагменты по косинусной близости", () => {
    const index: RagIndex = {
      ...emptyIndex("m"),
      chunks: [chunk("far", [0, 1]), chunk("near", [1, 0.1]), chunk("mid", [1, 1])],
    };
    const hits = search(index, [1, 0], 2);
    expect(hits.map((h) => h.chunk.id)).toEqual(["near", "mid"]);
    expect(hits[0].score).toBeGreaterThan(hits[1].score);
  });
});
