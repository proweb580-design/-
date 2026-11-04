import { BriefcaseIcon, ChatsCircleIcon, CodeIcon, FolderOpenIcon, GiftIcon, SparkleIcon, StackIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./reveal";
import { container } from "@/lib/ui";

// glow: цвет свечения на чёрном фоне.
const cards = [
  { glow: "#0891b2", icon: StackIcon, big: "15+", title: "программ обучения", text: "от первых шагов до продвинутого уровня" },
  { glow: "#65a30d", icon: CodeIcon, title: "Максимум практики", text: "задания после каждого урока" },
  { glow: "#7c3aed", icon: ChatsCircleIcon, title: "Наставник на связи", text: "проверяет задания и подсказывает, что поправить" },
  { glow: "#16a34a", icon: GiftIcon, title: "Бесплатное пробное занятие", text: "попробуйте, прежде чем принять решение" },
  { glow: "#2563eb", icon: BriefcaseIcon, title: "Карьерная поддержка", text: "резюме, тренировка собеседований и поиск первых заказов" },
  { glow: "#ea580c", icon: UsersThreeIcon, title: "Небольшие группы", text: "каждый получает внимание преподавателя" },
  { glow: "#ca8a04", icon: FolderOpenIcon, title: "Портфолио из реальных работ", text: "сайт, макет, дашборд или кампания в каждом модуле" },
  { glow: "#db2777", icon: SparkleIcon, title: "AI-ассистент 24/7", text: "ответит про курсы, цены и расписание по документам центра" },
];

// Свечение по очереди: полоса справа, сияние снизу, дуга в правом нижнем углу.
const glows = [
  (c: string) => `radial-gradient(30% 120% at 92% 10%, ${c} 0%, transparent 70%), radial-gradient(60% 60% at 100% 100%, ${c}55 0%, transparent 70%)`,
  (c: string) => `radial-gradient(90% 70% at 50% 115%, ${c} 0%, transparent 70%), radial-gradient(50% 40% at 0% 100%, ${c}66 0%, transparent 70%)`,
  (c: string) => `radial-gradient(120% 60% at 110% 105%, ${c} 0%, ${c}88 25%, transparent 60%)`,
];

export function WhyUs() {
  return (
    <section id="why" className="panel-in mx-2 rounded-panel bg-bg py-20 sm:mx-3 md:py-28">
      <div className={container}>
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Почему выбирают Ступень</h2>
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ glow, icon: Icon, big, title, text }, i) => (
            <li key={title}>
              <Reveal delay={(i % 4) * 0.06} className="h-full">
                <div
                  className="relative flex h-full min-h-[200px] flex-col justify-between gap-8 overflow-hidden rounded-card bg-[#050507] p-6 text-white lg:min-h-[220px]"
                  style={{ backgroundImage: glows[i % glows.length](glow) }}
                >
                  <Icon aria-hidden="true" size={28} weight="duotone" className="absolute right-6 top-6 opacity-80" />
                  <h3 className="relative flex flex-col gap-2 pr-10 text-lg font-bold leading-tight tracking-tight">
                    {big && <span className="text-5xl leading-none tracking-tighter">{big}</span>}
                    {title}
                  </h3>
                  <p className="relative max-w-[26ch] text-sm leading-snug text-white/70">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
