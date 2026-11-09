import { GoogleGenAI } from "@google/genai";

/** Ключ не задан: отличаем от прочих ошибок, чтобы чат подсказал, что поправить в .env. */
export class MissingApiKeyError extends Error {
  constructor() {
    super("GEMINI_API_KEY не задан: впишите ключ в файл .env и перезапустите сервер.");
  }
}

let client: GoogleGenAI | null = null;

/** Клиент создаётся при первом запросе, чтобы сайт запускался и без ключа. */
export function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();
  client ??= new GoogleGenAI({ apiKey });
  return client;
}
