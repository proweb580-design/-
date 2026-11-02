import Image from "next/image";
import { BriefcaseIcon, ChalkboardTeacherIcon, FolderOpenIcon, HandshakeIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./reveal";
import { container } from "@/lib/ui";

const steps = [
  {
    icon: HandshakeIcon,
    title: "Пробное занятие",
    text: "Знакомитесь с направлением, преподавателем и форматом занятий до начала курса.",
  },
  {
    icon: ChalkboardTeacherIcon,
    title: "Занятия в группе",
    text: "Теория на уроках, практика в домашних заданиях, которые проверяет наставник.",
  },
  {
    icon: FolderOpenIcon,
    title: "Проекты в портфолио",
    text: "Каждый модуль заканчивается работой, которую можно показать работодателю.",
  },
  {
    icon: BriefcaseIcon,
    title: "Подготовка к работе",
    text: "Резюме, разбор собеседований и советы, как найти первые заказы.",
  },
];

export function LearningPath() {
  return (
    <section id="path" className="border-y border-line bg-surface py-20 md:py-28">
      <div className={`${container} grid gap-12 md:grid-cols-[5fr_7fr] md:gap-16`}>
        <Reveal className="md:sticky md:top-24 md:self-start">
          {/* TODO: заменить на реальное фото наставника со студентом, 1000x1250 */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface-2 md:aspect-[4/5]">
            <Image
              src="https://picsum.photos/seed/stupen-mentor-session/1000/1250"
              alt="Наставник разбирает задание со студентом"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Как проходит обучение</h2>
            <p className="mt-4 max-w-[55ch] text-lg leading-relaxed text-muted">
              Путь от первого занятия до готового портфолио.
            </p>
          </Reveal>
          <ol className="relative mt-12 space-y-10 border-l border-line pl-8">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative">
                {/* Центр иконки на линии списка: 32px отступа + 1px линии + половина иконки. */}
                <span className="absolute -left-[52px] top-0 flex size-[38px] items-center justify-center rounded-full border border-line bg-surface text-accent">
                  <Icon size={20} weight="duotone" />
                </span>
                <Reveal delay={i * 0.06}>
                  <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 max-w-[52ch] leading-relaxed text-muted">{text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
