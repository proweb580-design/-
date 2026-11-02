export interface ChunkOptions {
  size: number;
  overlap: number;
}

/**
 * Режет текст на куски примерно по `size` символов, стараясь не рвать абзацы.
 * Соседние куски перекрываются на `overlap` символов, чтобы факт на стыке
 * попадал в поиск целиком.
 */
export function chunkText(text: string, { size, overlap }: ChunkOptions): string[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n\n/).flatMap((p) => splitLong(p, size));
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length <= size) {
      current = candidate;
      continue;
    }
    chunks.push(current);
    const tail = current.slice(-overlap);
    current = tail ? `${tail}\n\n${paragraph}` : paragraph;
  }
  if (current) chunks.push(current);
  return chunks;
}

function splitLong(paragraph: string, size: number): string[] {
  if (paragraph.length <= size) return [paragraph];
  const sentences = paragraph.match(/[^.!?\n]+[.!?]*\s*/g) ?? [paragraph];
  const parts: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > size && current) {
      parts.push(current.trim());
      current = "";
    }
    // Одно «предложение» длиннее лимита режем жёстко.
    if (sentence.length > size) {
      for (let i = 0; i < sentence.length; i += size) parts.push(sentence.slice(i, i + size).trim());
      continue;
    }
    current += sentence;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}
