import { fork, type ChildProcess } from "node:child_process";
import path from "node:path";
import { ragConfig } from "./config";
import { getGemini } from "./gemini";

export type EmbedKind = "query" | "passage";
export type Embedder = (texts: string[], kind: EmbedKind) => Promise<number[][]>;

/** Модель эмбеддингов не запускается; повторять до перезапуска сервера бессмысленно. */
export class EmbeddingUnavailableError extends Error {}

const WINDOWS_ACCESS_VIOLATION = 3221225477; // 0xC0000005

let worker: ChildProcess | null = null;
let unavailable: EmbeddingUnavailableError | null = null;
let seq = 0;
const pending = new Map<number, { resolve: (v: number[][]) => void; reject: (e: Error) => void }>();

function crashError(code: number | null, signal: NodeJS.Signals | null): EmbeddingUnavailableError {
  if (code === WINDOWS_ACCESS_VIOLATION) {
    return new EmbeddingUnavailableError(
      "Локальная модель эмбеддингов аварийно завершилась (0xC0000005). На Windows это обычно значит, что устарел " +
        "Microsoft Visual C++ Redistributable: установите последнюю версию x64 с сайта Microsoft и перезапустите сервер.",
    );
  }
  return new EmbeddingUnavailableError(
    `Процесс эмбеддингов завершился (код ${code ?? "нет"}, сигнал ${signal ?? "нет"}). Перезапустите сервер.`,
  );
}

function getWorker(): ChildProcess {
  if (worker) return worker;
  const child = fork(
    path.join(process.cwd(), "lib", "rag", "embed-worker.mjs"),
    [ragConfig.localEmbeddingModel, ragConfig.modelCacheDir],
    { stdio: ["ignore", "inherit", "inherit", "ipc"] },
  );
  child.on("message", (msg: { id: number; vectors?: number[][]; error?: string }) => {
    const job = pending.get(msg.id);
    if (!job) return;
    pending.delete(msg.id);
    if (msg.vectors) job.resolve(msg.vectors);
    else job.reject(new Error(msg.error ?? "Ошибка эмбеддингов"));
  });
  child.on("exit", (code, signal) => {
    worker = null;
    unavailable = crashError(code, signal);
    console.error("[embed]", unavailable.message);
    for (const job of pending.values()) job.reject(unavailable);
    pending.clear();
  });
  worker = child;
  return child;
}

/** Локальные эмбеддинги, нормализованные: косинусная близость = скалярное произведение. */
const localEmbed: Embedder = async (texts, kind) => {
  if (texts.length === 0) return [];
  if (unavailable) throw unavailable;
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    // Модель e5 обучена с префиксами "query:" и "passage:".
    getWorker().send({ id, texts: texts.map((t) => `${kind}: ${t}`) });
  });
};

const GEMINI_DIMENSIONS = 768;

function normalize(vector: number[]): number[] {
  const norm = Math.hypot(...vector) || 1;
  return vector.map((x) => x / norm);
}

/** Эмбеддинги Gemini. При урезанной размерности вектор не нормирован, поэтому нормируем сами. */
const geminiEmbed: Embedder = async (texts, kind) => {
  if (texts.length === 0) return [];
  const response = await getGemini().models.embedContent({
    model: ragConfig.geminiEmbeddingModel,
    contents: texts,
    config: {
      taskType: kind === "query" ? "RETRIEVAL_QUERY" : "RETRIEVAL_DOCUMENT",
      outputDimensionality: GEMINI_DIMENSIONS,
    },
  });
  const vectors = response.embeddings?.map((e) => e.values ?? []) ?? [];
  if (vectors.length !== texts.length || vectors.some((v) => v.length === 0)) {
    throw new Error("Gemini вернул неполный ответ на запрос эмбеддингов");
  }
  return vectors.map(normalize);
};

export const embed: Embedder = ragConfig.embeddingProvider === "local" ? localEmbed : geminiEmbed;
