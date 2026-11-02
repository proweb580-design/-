import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./reveal";
import { container } from "@/lib/ui";

const items = [
  {
    q: "Нужен ли опыт, чтобы начать?",
    a: "Нет. Базовые программы рассчитаны на новичков. Понадобится компьютер и несколько часов в неделю на практику.",
  },
  {
    q: "Можно учиться онлайн?",
    a: "Формат зависит от направления. Актуальное расписание онлайн- и офлайн-групп подскажет ассистент или менеджер.",
  },
  {
    q: "Сколько стоит обучение?",
    a: "Стоимость зависит от программы и её длительности. Цены по материалам центра назовёт ассистент, удобный вариант оплаты подберёт менеджер.",
  },
  {
    q: "Что я получу после курса?",
    a: "Проекты в портфолио и навыки, с которыми можно откликаться на стажировки и первые вакансии.",
  },
  {
    q: "Как работает AI-ассистент?",
    a: "Он ищет ответ в документах центра: программах, прайсах и правилах. Если ответа там нет, ассистент так и скажет и не будет выдумывать.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-y border-line bg-surface py-20 md:py-28">
      <div className={`${container} grid gap-10 md:grid-cols-[4fr_8fr] md:gap-16`}>
        <Reveal className="md:sticky md:top-24 md:self-start">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Частые вопросы</h2>
        </Reveal>
        <Reveal delay={0.08} className="divide-y divide-line border-y border-line">
          {items.map(({ q, a }) => (
            <details key={q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <PlusIcon
                  size={20}
                  className="shrink-0 text-muted transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                />
              </summary>
              <p className="max-w-[60ch] pb-5 leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
