import { ApplyForm } from "./apply-form";
import { Reveal } from "./reveal";
import { container } from "@/lib/ui";

export function ApplySection() {
  return (
    <section id="apply" className={`${container} py-20 md:py-28`}>
      <Reveal className="mx-auto max-w-3xl rounded-card border border-line bg-surface p-6 sm:p-10">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Записаться на пробное занятие</h2>
        <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-muted">
          Оставьте контакты. Менеджер позвонит, ответит на вопросы и подберёт группу.
        </p>
        <div className="mt-8">
          <ApplyForm />
        </div>
      </Reveal>
    </section>
  );
}
