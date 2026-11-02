import path from "node:path";

const root = process.cwd();

export const ragConfig = {
  documentsDir: path.resolve(root, process.env.DOCUMENTS_DIR ?? "documents"),
  indexFile: path.resolve(root, "data", "index.json"),
  modelCacheDir: path.resolve(root, ".cache", "models"),
  // Мультиязычная модель: русский, узбекский, английский. Требует префиксов "query:" / "passage:".
  embeddingModel: "Xenova/multilingual-e5-small",
  chunkSize: 1200,
  chunkOverlap: 200,
  topK: 5,
  answerModel: process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5",
} as const;

export const SUPPORTED_EXTENSIONS = [".md", ".txt", ".pdf", ".docx"] as const;
