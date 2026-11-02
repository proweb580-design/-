import { ragConfig } from "./config";
import { embed } from "./embed";
import { syncSource, type SyncReport } from "./indexer";
import { LocalFolderSource } from "./loader";
import type { DocumentSource } from "./source";
import { loadIndex, saveIndex, search, type RagIndex, type SearchHit } from "./store";

/**
 * Одна база знаний на процесс. Источники перечислены здесь: когда появится
 * Google Drive, он добавится в этот список.
 */
const sources: DocumentSource[] = [new LocalFolderSource(ragConfig.documentsDir)];

let current: RagIndex | null = null;
let syncing: Promise<SyncReport[]> | null = null;

const chunking = { size: ragConfig.chunkSize, overlap: ragConfig.chunkOverlap };

/** Синхронизирует индекс со всеми источниками. Параллельные вызовы ждут один и тот же проход. */
export function reindex(): Promise<SyncReport[]> {
  syncing ??= (async () => {
    try {
      let index = current ?? (await loadIndex(ragConfig.indexFile, ragConfig.embeddingModel));
      const reports: SyncReport[] = [];
      for (const source of sources) {
        const result = await syncSource(index, source, embed, chunking);
        index = result.index;
        reports.push(result.report);
      }
      await saveIndex(ragConfig.indexFile, index);
      current = index;
      return reports;
    } finally {
      syncing = null;
    }
  })();
  return syncing;
}

/** Индекс, синхронизированный хотя бы один раз за жизнь процесса. */
export async function getIndex(): Promise<RagIndex> {
  if (!current) await reindex();
  return current!;
}

export async function retrieve(question: string): Promise<SearchHit[]> {
  const index = await getIndex();
  if (index.chunks.length === 0) return [];
  const [vector] = await embed([question], "query");
  return search(index, vector, ragConfig.topK);
}
