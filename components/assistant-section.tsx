import { Chat } from "./chat";
import { Reveal } from "./reveal";
import { container } from "@/lib/ui";

export function AssistantSection() {
  return (
    <section id="assistant" className={`${container} py-20 md:py-28`}>
      <Reveal className="max-w-[60ch]">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">AI-ассистент</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Спросите про курсы, цены и расписание</h2>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Ассистент отвечает по документам центра и показывает, из какого файла взят ответ.
        </p>
      </Reveal>
      <Reveal delay={0.08} className="mt-10 max-w-4xl">
        <Chat />
      </Reveal>
    </section>
  );
}
