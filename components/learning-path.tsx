import Image from "next/image";
import { BriefcaseIcon, CaretDownIcon, ChalkboardTeacherIcon, FolderOpenIcon, HandshakeIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./reveal";
import { container } from "@/lib/ui";

const steps = [
  {
    icon: HandshakeIcon,
    title: "Пробное занятие",
    text: "Знакомитесь с направлением, преподавателем и форматом занятий до начала курса.",
    details:
      "Приходите на бесплатный урок: познакомитесь с преподавателем, посмотрите, как идут занятия, и решите, подходит ли вам направление. Покупать ничего заранее не нужно.",
    photo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&q=80",
    alt: "Знакомство с преподавателем за ноутбуком",
  },
  {
    icon: ChalkboardTeacherIcon,
    title: "Занятия в группе",
    text: "Теория на уроках, практика в домашних заданиях, которые проверяет наставник.",
    details:
      "Группы небольшие, поэтому каждый получает внимание. Преподаватель объясняет тему, затем все вместе разбирают задачи. Домашние задания проверяет наставник и подсказывает, что поправить.",
    photo: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&q=80",
    alt: "Студенты вместе работают за столом",
  },
  {
    icon: FolderOpenIcon,
    title: "Проекты в портфолио",
    text: "Каждый модуль заканчивается работой, которую можно показать работодателю.",
    details:
      "Каждый модуль заканчивается работой: сайтом, макетом, дашбордом или маркетинговой кампанией. Всё, что вы сделаете, попадает в портфолио, которое можно показать работодателю.",
    photo: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1000&q=80",
    alt: "Дизайнерские палитры и макеты на столе",
  },
  {
    icon: BriefcaseIcon,
    title: "Подготовка к работе",
    text: "Резюме, разбор собеседований и советы, как найти первые заказы.",
    details:
      "Помогаем составить резюме, готовимся к собеседованию на тренировочных вопросах и разбираем, где искать первые заказы или вакансии.",
    photo: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1000&q=80",
    alt: "Рукопожатие при знакомстве",
  },
];

// Тёплые закатные оттенки карточек, как в форматах обучения на макете.
const tones = [
  "bg-[linear-gradient(165deg,#e9e2da,#d8cdc2)]",
  "bg-[linear-gradient(165deg,#efe9e2,#ddd3c8)]",
  "bg-[linear-gradient(165deg,#f3efe9,#e0d8cf)]",
  "bg-[linear-gradient(165deg,#e6dfd7,#cfc5ba)]",
];

export function LearningPath() {
  return (
    <section id="path" className="panel-in on-dark mx-2 rounded-panel bg-bg py-20 sm:mx-3 md:py-28">
      <div className={`${container} grid gap-12 md:grid-cols-[4fr_8fr] md:gap-16`}>
        <Reveal className="md:sticky md:top-24 md:self-start">
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Как проходит обучение</h2>
          <p className="mt-4 max-w-[40ch] text-lg leading-relaxed text-muted">
            Путь от первого занятия до готового портфолио.
          </p>
          {/* TODO: заменить на реальное фото наставника со студентом, 1000x750 */}
          <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-card bg-surface-2">
            <Image
              src="https://picsum.photos/seed/stupen-mentor-session/1000/750"
              alt="Наставник разбирает задание со студентом"
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <ol className="grid items-start gap-4 sm:grid-cols-2">
          {steps.map(({ icon: Icon, title, text, details, photo, alt }, i) => (
            <li key={title}>
              <Reveal delay={i * 0.06}>
                {/* Нативный details: открывается по клику без JS, с клавиатуры тоже работает. */}
                <details open className={`group rounded-card text-[#1f1d1d] ${tones[i]}`}>
                  <summary className="flex min-h-[260px] cursor-pointer list-none flex-col justify-between p-6 [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center justify-between">
                      <span className="flex size-11 items-center justify-center rounded-full bg-white/55">
                        <Icon size={22} weight="duotone" />
                      </span>
                      <span className="flex items-center gap-2 text-sm font-medium text-[#1f1d1d]/60">
                        0{i + 1}
                        <CaretDownIcon size={16} className="transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none" />
                      </span>
                    </div>
                    <div className="mt-10">
                      <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
                      <p className="mt-2 leading-relaxed text-[#1f1d1d]/75">{text}</p>
                    </div>
                  </summary>
                  <div className="px-6 pb-6">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-control bg-surface-2">
                      <Image src={photo} alt={alt} fill sizes="(min-width: 640px) 35vw, 100vw" className="object-cover" />
                    </div>
                    <p className="mt-4 leading-relaxed text-[#1f1d1d]/80">{details}</p>
                  </div>
                </details>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
