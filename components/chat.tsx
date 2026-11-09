"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowClockwiseIcon, ArrowUpIcon, RobotIcon, WarningCircleIcon } from "@phosphor-icons/react";

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
  "Есть ли курсы для детей?",
  "Можно ли учиться онлайн?",
];

const MAX_CHARS = 2000;
const INPUT_MAX_HEIGHT = 140;
const isDev = process.env.NODE_ENV === "development";

let nextId = 0;
const newId = () => `m${++nextId}`;

/** embedded: чат заполняет родителя (панель виджета) без своей рамки и фиксированной высоты. */
export function Chat({ embedded = false }: { embedded?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [indexErrors, setIndexErrors] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  // Поле ввода растёт вместе с текстом, полоса прокрутки появляется только сверх максимума.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, INPUT_MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > INPUT_MAX_HEIGHT ? "auto" : "hidden";
  }, [input]);

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
    } finally {
      setIndexing(false);
    }
  }

  return (
    <div className={`flex flex-col overflow-hidden bg-surface ${embedded ? "h-full" : "h-[620px] max-h-[80dvh] rounded-card border border-line"}`}>
      {isDev && (
        <div className="flex h-11 shrink-0 items-center justify-end border-b border-line px-4 text-xs text-muted">
          <button
            type="button"
            onClick={reindex}
            disabled={indexing}
            title="Переиндексировать документы"
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-60"
          >
            <ArrowClockwiseIcon size={14} className={indexing ? "motion-safe:animate-spin" : ""} />
            {indexing ? "Обновляю…" : "Обновить базу"}
          </button>
        </div>
      )}

      {isDev && indexErrors.length > 0 && (
        <ul className="space-y-1 border-b border-line bg-accent-soft px-4 py-3 text-xs" role="alert">
          {indexErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-5 [scrollbar-color:var(--line)_transparent] [scrollbar-width:thin]"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col justify-end gap-5">
            <div className="flex items-start gap-3">
              <Avatar />
              <div className="rounded-[18px] rounded-tl-md bg-surface-2 px-4 py-3 text-[15px] leading-relaxed">
                <p className="font-medium">Здравствуйте! Я ассистент «Ступени».</p>
                <p className="mt-1 text-muted">
                  Расскажу о курсах, ценах, формате обучения и записи. Отвечаю по материалам центра.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-12">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-full border border-line bg-bg px-3.5 py-2 text-left text-sm transition-[transform,border-color] hover:border-fg/40 active:scale-[0.98]"
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
                <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-[18px] rounded-br-md bg-accent px-4 py-2.5 text-[15px] leading-relaxed text-accent-fg">
                  {m.content}
                </p>
              </div>
            ) : (
              <div key={m.id} className="flex items-start gap-3">
                <Avatar />
                <div className="min-w-0 max-w-[85%]">
                  {m.pending ? (
                    <div
                      className="flex h-11 items-center gap-1.5 rounded-[18px] rounded-tl-md bg-surface-2 px-4"
                      aria-label="Ассистент готовит ответ"
                    >
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="size-2 rounded-full bg-muted/70 motion-safe:animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  ) : m.error ? (
                    <p className="flex items-start gap-2 rounded-[18px] rounded-tl-md bg-accent-soft px-4 py-3 text-[15px] leading-relaxed">
                      <WarningCircleIcon size={20} className="mt-0.5 shrink-0" />
                      {m.content}
                    </p>
                  ) : (
                    <p className="whitespace-pre-wrap break-words rounded-[18px] rounded-tl-md bg-surface-2 px-4 py-3 text-[15px] leading-relaxed">
                      {m.content}
                    </p>
                  )}
                </div>
              </div>
            ),
          )
        )}
      </div>

      <form
        className="shrink-0 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Ваш вопрос ассистенту
        </label>
        <div className="flex items-end gap-2 rounded-[22px] border border-line bg-bg p-1.5 pl-4 transition-colors focus-within:border-fg/40">
          <textarea
            ref={inputRef}
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
            placeholder="Напишите вопрос…"
            className="min-w-0 flex-1 resize-none overflow-hidden bg-transparent py-2 text-[15px] leading-6 placeholder:text-muted focus:outline-none [scrollbar-width:thin]"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Отправить вопрос"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-[transform,opacity] active:scale-[0.96] disabled:opacity-40"
          >
            <ArrowUpIcon size={18} weight="bold" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">Enter — отправить, Shift+Enter — новая строка</p>
      </form>
    </div>
  );
}

function Avatar() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg" aria-hidden>
      <RobotIcon size={18} weight="fill" />
    </span>
  );
}
