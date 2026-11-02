import { describe, expect, it } from "vitest";
import { chunkText } from "@/lib/rag/chunk";

const opts = { size: 200, overlap: 40 };

describe("chunkText", () => {
  it("возвращает пустой список для пустого текста", () => {
    expect(chunkText("   \n\n  ", opts)).toEqual([]);
  });

  it("оставляет короткий текст одним куском", () => {
    expect(chunkText("Курс длится три месяца.", opts)).toEqual(["Курс длится три месяца."]);
  });

  it("режет длинный текст по абзацам с перекрытием", () => {
    const paragraphs = Array.from({ length: 8 }, (_, i) => `Абзац ${i}. ${"Описание программы курса. ".repeat(3)}`);
    const chunks = chunkText(paragraphs.join("\n\n"), opts);

    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(opts.size + opts.overlap + 2);
    // Конец предыдущего куска повторяется в начале следующего.
    expect(chunks[1].startsWith(chunks[0].slice(-opts.overlap))).toBe(true);
    // Ни один абзац не потерян.
    for (let i = 0; i < 8; i++) expect(chunks.some((c) => c.includes(`Абзац ${i}.`))).toBe(true);
  });

  it("режет абзац без переносов строк по предложениям", () => {
    const long = "Занятия проходят два раза в неделю. ".repeat(20);
    const chunks = chunkText(long, opts);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(opts.size + opts.overlap + 2);
  });
});
