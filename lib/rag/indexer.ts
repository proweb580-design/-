import { chunkText, type ChunkOptions } from "./chunk";
import type { Embedder } from "./embed";
import type { DocumentSource } from "./source";
import type { IndexedChunk, IndexedDoc, RagIndex } from "./store";

const EMBED_BATCH = 16;

export interface SyncReport {
  added: string[];
  updated: string[];
  removed: string[];
  unchanged: number;
  failed: { name: string; error: string }[];
}

/**
 * Приводит индекс в соответствие с источником: новые и изменённые файлы
 * пересчитываются, удалённые выбрасываются, остальные остаются как есть.
 * Документы других источников (например, будущего Google Drive) не трогает.
 */
export async function syncSource(
  index: RagIndex,
  source: DocumentSource,
  embed: Embedder,
  chunking: ChunkOptions,
): Promise<{ index: RagIndex; report: SyncReport }> {
  const report: SyncReport = { added: [], updated: [], removed: [], unchanged: 0, failed: [] };
  const entries = await source.list();
  const existing = new Map(index.docs.filter((d) => d.source === source.kind).map((d) => [d.id, d]));
  const seen = new Set(entries.map((e) => e.id));

  const keepDocs: IndexedDoc[] = index.docs.filter((d) => d.source !== source.kind || seen.has(d.id));
  let keepChunks: IndexedChunk[] = index.chunks.filter((c) => {
    const doc = index.docs.find((d) => d.id === c.docId);
    return !doc || doc.source !== source.kind || seen.has(c.docId);
  });
  for (const doc of existing.values()) if (!seen.has(doc.id)) report.removed.push(doc.name);

  const docs = [...keepDocs];
  for (const entry of entries) {
    const prev = existing.get(entry.id);
    if (prev && prev.hash === entry.hash) {
      report.unchanged++;
      continue;
    }
    try {
      const text = await source.readText(entry);
      const pieces = chunkText(text, chunking);
      const vectors: number[][] = [];
      for (let i = 0; i < pieces.length; i += EMBED_BATCH) {
        vectors.push(...(await embed(pieces.slice(i, i + EMBED_BATCH), "passage")));
      }
      keepChunks = keepChunks.filter((c) => c.docId !== entry.id);
      keepChunks.push(
        ...pieces.map((piece, i) => ({
          id: `${entry.id}#${i}`,
          docId: entry.id,
          docName: entry.name,
          text: piece,
          vector: vectors[i],
        })),
      );
      const doc: IndexedDoc = {
        id: entry.id,
        name: entry.name,
        hash: entry.hash,
        source: source.kind,
        chunkCount: pieces.length,
        indexedAt: new Date().toISOString(),
      };
      const at = docs.findIndex((d) => d.id === entry.id);
      if (at >= 0) docs[at] = doc;
      else docs.push(doc);
      (prev ? report.updated : report.added).push(entry.name);
    } catch (error) {
      report.failed.push({ name: entry.name, error: (error as Error).message });
    }
  }

  return { index: { ...index, docs, chunks: keepChunks }, report };
}
