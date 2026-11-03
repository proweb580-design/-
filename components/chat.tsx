"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowClockwiseIcon, ArrowUpIcon, FileTextIcon, WarningCircleIcon } from "@phosphor-icons/react";

interface SourceRef {
  n: number;
  name: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceRef[];
  error?: boolean;
  pending?: boolean;
}

type ChatEvent =
  | { type: "sources"; sources: SourceRef[] }
  | { type: "text"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

const SUGGESTIONS = [
  "Какие курсы подойдут новичку?",
  "Сколько стоит обучение?",
  "Когда стартует ближайшая группа?",
  "Можно ли учиться онлайн?",
];

const MAX_CHARS = 2000;
const isDev = process.env.NODE_ENV === "development";

function plural(n: number, [one, few, many]: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** Номера фрагментов, сгруппированные по файлу: «courses.md [1, 3]». */
function groupSources(sources: SourceRef[]) {
  const groups = new Map<string, number[]>();
  for (const s of sources) groups.set(s.name, [...(groups.get(s.name) ?? []), s.n]);
  return [...groups.entries()];
}

let nextId = 0;
const newId = () => `m${++nextId}`;

/** embedded: чат заполняет родителя (панель виджета) без своей рамки и фиксированной высоты. */
export function Chat({ embedded = false }: { embedded?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [docCount, setDocCount] = useState<number | null>(null);
  const [indexing, setIndexing] = useState(false);
  const [indexErrors, setIndexErrors] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocCount(Array.isArray(data.documents) ? data.documents.length : null);
    } catch {
      setDocCount(null);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    return () => abortRef.current?.abort();
  }, [loadStatus]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const patchLast = (patch: (m: Message) => Message) =>
    setMessages((prev) => [...prev.slice(0, -1), patch(prev[prev.length - 1])]);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;

    const history = [...messages.filter((m) => !m.error && !m.pending), { id: newId(), role: "user" as const, content: text }];
    setMessages([...history, { id: newId(), role: "assistant", content: "", pending: true }]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error("bad response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as ChatEvent;
          if (event.type === "sources") patchLast((m) => ({ ...m, sources: event.sources }));
          else if (event.type === "text") patchLast((m) => ({ ...m, pending: false, content: m.content + event.text }));
          else if (event.type === "error")
            patchLast((m) => ({ ...m, pending: false, error: true, content: event.message }));
        }
      }
      patchLast((m) => ({ ...m, pending: false }));
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      patchLast((m) => ({
        ...m,
        pending: false,
        error: true,
        content: "Не удалось получить ответ. Проверьте соединение и попробуйте ещё раз.",
      }));
    } finally {
      setBusy(false);
    }
  }

  async function reindex() {
    setIndexing(true);
    try {
      const res = await fetch("/api/documents", { method: "POST" });
      const data = await res.json();
      const failed: { name: string; error: string }[] = (data.reports ?? []).flatMap((r: { failed: [] }) => r.failed);
      setIndexErrors(
        res.ok ? failed.map((f) => `${f.name}: ${f.error}`) : [data.error ?? "Не удалось обновить базу знаний"],
      );
      await loadStatus();
    } finally {
      setIndexing(false);
    }
  }

  return (
    <div className={`flex flex-col overflow-hidden bg-surface ${embedded ? "h-full" : "h-[620px] max-h-[80dvh] rounded-card border border-line"}`}>
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 text-sm text-muted">
        <span className="flex items-center gap-2">
          <FileTextIcon size={18} />
          {docCount === null
            ? "Проверяю базу знаний..."
            : docCount === 0
              ? "Документы центра ещё не загружены"
              : `База знаний: ${docCount} ${plural(docCount, ["документ", "документа", "документов"])}`}
        </span>
        {isDev && (
          <button
            type="button"
            onClick={reindex}
            disabled={indexing}
            className="flex items-center gap-1.5 rounded-control px-2 py-1 transition-colors hover:text-fg disabled:opacity-60"
          >
            <ArrowClockwiseIcon size={16} className={indexing ? "motion-safe:animate-spin" : ""} />
            {indexing ? "Обновляю..." : "Обновить базу"}
          </button>
        )}
      </div>

      {isDev && indexErrors.length > 0 && (
        <ul className="space-y-1 border-b border-line bg-accent-soft px-5 py-3 text-sm" role="alert">
          {indexErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div ref={listRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-end">
            <p className="max-w-[48ch] text-muted">
              Задайте вопрос о курсах, ценах, расписании или условиях записи. Ответ будет основан на документах центра.
            </p>
            <div className="-mx-5 mt-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="shrink-0 snap-start rounded-full border border-line bg-bg px-3.5 py-2 text-sm transition-[transform,border-color] hover:border-fg/40 active:scale-[0.98]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-card bg-accent px-4 py-2.5 text-accent-fg">
                  {m.content}
                </p>
              </div>
            ) : (
              <div key={m.id} className="max-w-[92%]">
                {m.pending ? (
                  <div className="space-y-2 py-1" aria-label="Ассистент готовит ответ">
                    <div className="h-3 w-64 max-w-full rounded-full bg-surface-2 motion-safe:animate-pulse" />
                    <div className="h-3 w-48 max-w-full rounded-full bg-surface-2 motion-safe:animate-pulse" />
                    <div className="h-3 w-56 max-w-full rounded-full bg-surface-2 motion-safe:animate-pulse" />
                  </div>
                ) : m.error ? (
                  <p className="flex items-start gap-2 text-[15px] leading-relaxed text-accent">
                    <WarningCircleIcon size={20} className="mt-0.5 shrink-0" />
                    {m.content}
                  </p>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                )}
                {!m.pending && !m.error && m.sources && m.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span>Источники:</span>
                    {groupSources(m.sources).map(([name, ns]) => (
                      <span key={name} className="inline-flex items-center gap-1 rounded-control border border-line px-2 py-1">
                        <FileTextIcon size={14} />
                        {name} [{ns.join(", ")}]
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ),
          )
        )}
      </div>

      <form
        className="border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Ваш вопрос ассистенту
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="chat-input"
            rows={1}
            value={input}
            maxLength={MAX_CHARS}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            placeholder="Например: чем отличается веб-разработка от UX/UI?"
            className="max-h-40 min-h-11 flex-1 resize-none rounded-control border border-line bg-bg px-3.5 py-2.5 text-[15px] placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Отправить вопрос"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-transform active:scale-[0.96] disabled:opacity-50"
          >
            <ArrowUpIcon size={20} weight="bold" />
          </button>
        </div>
      </form>
    </div>
  );
}
