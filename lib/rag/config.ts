import path from "node:path";

const root = process.cwd();

// gemini — эмбеддинги через Gemini API; local — модель на этом компьютере (нужен свежий VC++ Redistributable на Windows).
const embeddingProvider = process.env.EMBEDDING_PROVIDER === "local" ? "local" : "gemini";
// Мультиязычная модель: русский, узбекский, английский. Требует префиксов "query:" / "passage:".
const localEmbeddingModel = "Xenova/multilingual-e5-small";
const geminiEmbeddingModel = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

export const ragConfig = {
  documentsDir: path.resolve(root, process.env.DOCUMENTS_DIR ?? "documents"),
  indexFile: path.resolve(root, "data", "index.json"),
  modelCacheDir: path.resolve(root, ".cache", "models"),
  embeddingProvider,
  localEmbeddingModel,
  geminiEmbeddingModel,
  // Модель, которой построен индекс: при её смене индекс пересобирается с нуля.
  embeddingModel: embeddingProvider === "local" ? localEmbeddingModel : geminiEmbeddingModel,
  chunkSize: 1200,
  chunkOverlap: 200,
  topK: 5,
  answerModel: process.env.GEMINI_MODEL || "gemini-3.6-flash",
} as const;

export const SUPPORTED_EXTENSIONS = [".md", ".txt", ".pdf", ".docx"] as const;
