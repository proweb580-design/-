import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export interface IndexedDoc {
  id: string;
  name: string;
  hash: string;
  source: string;
  chunkCount: number;
  indexedAt: string;
}

export interface IndexedChunk {
  id: string;
  docId: string;
  docName: string;
  text: string;
  vector: number[];
}

export interface RagIndex {
  version: 1;
  model: string;
  docs: IndexedDoc[];
  chunks: IndexedChunk[];
}

export interface SearchHit {
  chunk: IndexedChunk;
  score: number;
}

export function emptyIndex(model: string): RagIndex {
  return { version: 1, model, docs: [], chunks: [] };
}

/** Индекс другой модели несовместим по векторам, поэтому строим заново. */
export async function loadIndex(file: string, model: string): Promise<RagIndex> {
  try {
    const parsed = JSON.parse(await readFile(file, "utf8")) as RagIndex;
    if (parsed.version !== 1 || parsed.model !== model) return emptyIndex(model);
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyIndex(model);
    throw error;
  }
}

export async function saveIndex(file: string, index: RagIndex): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(index), "utf8");
  await rename(tmp, file);
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

export function search(index: RagIndex, query: number[], topK: number): SearchHit[] {
  return index.chunks
    .map((chunk) => ({ chunk, score: cosine(chunk.vector, query) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
