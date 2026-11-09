import { ApiError } from "@google/genai";
import { sourceRefs, streamAnswer, type ChatTurn } from "@/lib/rag/answer";
import { MissingApiKeyError } from "@/lib/rag/gemini";
import { EmbeddingUnavailableError } from "@/lib/rag/embed";
import { retrieve } from "@/lib/rag/knowledge-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TURNS = 12;
const MAX_CHARS = 2000;

/** Ответ идёт построчным JSON: {type:"sources"}, затем {type:"text"} кусками, в конце {type:"done"} или {type:"error"}. */
type ChatEvent =
  | { type: "sources"; sources: { n: number; name: string }[] }
  | { type: "text"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

function parseHistory(body: unknown): ChatTurn[] | null {
  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const turns = messages.slice(-MAX_TURNS);
  const valid = turns.every(
    (m) =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0 &&
      m.content.length <= MAX_CHARS * 4,
  );
  if (!valid) return null;
  const last = turns[turns.length - 1];
  if (last.role !== "user" || last.content.length > MAX_CHARS) return null;
  // История должна начинаться с вопроса пользователя.
  const start = turns.findIndex((m) => m.role === "user");
  return turns.slice(start).map((m) => ({ role: m.role, content: m.content.trim() }));
}

function errorMessage(error: unknown): string {
  if (error instanceof EmbeddingUnavailableError) {
    return process.env.NODE_ENV === "production"
      ? "Поиск по документам временно не работает. Оставьте заявку, и менеджер ответит на ваш вопрос."
      : error.message;
  }
  const keyHint = "Ассистент не подключён к Gemini API: проверьте GEMINI_API_KEY в файле .env.";
  if (error instanceof MissingApiKeyError) return keyHint;
  if (error instanceof ApiError) {
    // Неверный ключ Gemini возвращает 400 с текстом «API key not valid».
    if (error.status === 401 || error.status === 403 || /api key/i.test(error.message)) return keyHint;
    if (error.status === 429) return "Сейчас слишком много запросов. Попробуйте через минуту.";
    if (error.status === 404) return "Модель из GEMINI_MODEL не найдена. Проверьте её название в файле .env.";
    return "Сервис ответов временно недоступен. Попробуйте ещё раз чуть позже.";
  }
  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return "Нет связи с Gemini API. Проверьте интернет и попробуйте ещё раз.";
  }
  return "Что-то пошло не так при подготовке ответа.";
}

export async function POST(request: Request) {
  let history: ChatTurn[] | null = null;
  try {
    history = parseHistory(await request.json());
  } catch {
    history = null;
  }
  if (!history) {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  const turns = history;

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        const hits = await retrieve(turns[turns.length - 1].content);
        send({ type: "sources", sources: sourceRefs(hits) });

        if (hits.length === 0) {
          send({
            type: "text",
            text: "Пока я не могу ответить: в базу знаний ещё не загружены документы центра. Оставьте заявку на сайте, и менеджер ответит на ваш вопрос.",
          });
        } else {
          for await (const text of streamAnswer(turns, hits)) send({ type: "text", text });
        }
        send({ type: "done" });
      } catch (error) {
        console.error("[chat]", error);
        send({ type: "error", message: errorMessage(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
