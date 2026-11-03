"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  CaretDownIcon,
  CaretLeftIcon,
  ChatTeardropDotsIcon,
  PencilSimpleIcon,
  RobotIcon,
} from "@phosphor-icons/react";
import { Chat } from "./chat";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Плавающий чат в углу экрана: кнопка открывает панель с AI-ассистентом.
 * Панель не размонтируется при сворачивании, поэтому переписка с ассистентом сохраняется.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"home" | "chat">("home");
  const [chatStarted, setChatStarted] = useState(false);
  const [seen, setSeen] = useState(false);
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setSeen(true);
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  function openChat() {
    setChatStarted(true);
    setView("chat");
  }

  const hidden = { opacity: 0, y: 16, scale: 0.96 };

  return (
    <>
      <motion.div
        ref={panelRef}
        id="chat-widget"
        role="dialog"
        aria-label="Чат с AI-ассистентом"
        tabIndex={-1}
        inert={!open}
        initial={{ ...hidden, visibility: "hidden" }}
        animate={open ? { opacity: 1, y: 0, scale: 1, visibility: "visible" } : { ...hidden, transitionEnd: { visibility: "hidden" } }}
        transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
        className="fixed bottom-24 right-4 z-40 flex h-[min(620px,calc(100dvh-8rem))] w-[min(400px,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-[28px] bg-[#1f1d1d] shadow-[0_24px_60px_rgba(0,0,0,0.28)] outline-none sm:right-6"
      >
        <div className="relative flex h-16 shrink-0 items-center justify-center px-16 text-[#f4efe9]">
          {view === "chat" && (
            <button
              type="button"
              onClick={() => setView("home")}
              aria-label="Назад"
              className="absolute left-4 flex size-9 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
            >
              <CaretLeftIcon size={18} weight="bold" />
            </button>
          )}
          <span className="text-lg font-semibold tracking-tight">Ступень</span>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              buttonRef.current?.focus();
            }}
            aria-label="Свернуть чат"
            className="absolute right-4 flex size-9 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
          >
            <CaretDownIcon size={18} weight="bold" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-t-[24px] bg-surface text-fg">
          {view === "home" && (
            <div className="h-full overflow-y-auto p-5">
              <div className="flex justify-center gap-8">
                <button type="button" onClick={openChat} className="group flex flex-col items-center gap-2 text-sm font-medium">
                  <span className="flex size-12 items-center justify-center rounded-full bg-[#1f1d1d] text-white transition-transform duration-300 group-hover:scale-105">
                    <PencilSimpleIcon size={22} weight="fill" />
                  </span>
                  Написать
                </button>
              </div>

              <div className="mt-6 flex items-center gap-3 text-sm text-muted">
                <span className="h-px flex-1 bg-line" />
                Недавно
              </div>
              <button
                type="button"
                onClick={openChat}
                className="mt-3 flex w-full items-center gap-3 rounded-[18px] bg-surface-2 p-3 text-left transition-colors hover:bg-line"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface">
                  <RobotIcon size={22} weight="duotone" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">AI-ассистент Ступени</span>
                  <span className="block truncate text-sm text-muted">Спросите про курсы, цены и расписание</span>
                </span>
              </button>
            </div>
          )}
          {/* Чат монтируется при первом открытии и дальше только прячется, чтобы не терять переписку. */}
          {chatStarted && (
            <div className={view === "chat" ? "h-full" : "hidden"}>
              <Chat embedded />
            </div>
          )}
        </div>
      </motion.div>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="chat-widget"
        aria-label={open ? "Закрыть чат" : "Открыть чат с ассистентом"}
        className="fixed bottom-5 right-4 z-40 flex size-16 items-center justify-center rounded-full bg-surface text-[#1f1d1d] shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:scale-105 active:scale-95 sm:right-6"
      >
        <ChatTeardropDotsIcon size={30} weight="fill" />
        {!seen && (
          <span className="absolute -right-0.5 -top-0.5 flex size-6 items-center justify-center rounded-full bg-[#e5484d] text-xs font-semibold text-white">
            1
          </span>
        )}
      </button>
    </>
  );
}
