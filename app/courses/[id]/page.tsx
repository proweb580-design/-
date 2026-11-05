import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplySection } from "@/components/apply-section";
import { ChatWidget } from "@/components/chat-widget";
import { tones } from "@/components/courses";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { courses } from "@/lib/courses";
import { btnPrimary, container } from "@/lib/ui";

type Props = { params: Promise<{ id: string }> };

// Логотипы программ лежат в public/tools (из наборов Iconify). Нет в списке: чип без значка.
const toolIcons: Record<string, string> = {
  "VS Code": "vscode",
  "Git и GitHub": "git",
  "Chrome DevTools": "chrome",
  Figma: "figma",
  FigJam: "figma",
  "Node.js": "nodejs",
  PostgreSQL: "postgresql",
  Miro: "miro",
  Notion: "notion",
  Photoshop: "photoshop",
  "Meta Ads Manager": "meta",
  Instagram: "instagram",
  Telegram: "telegram",
  Canva: "canva",
  CapCut: "capcut",
  "Google Analytics": "google-analytics",
  Excel: "excel",
  "Google Sheets": "google-sheets",
  Python: "python",
  "Jupyter Notebook": "jupyter",
  "Power BI": "powerbi",
  Jira: "jira",
  Trello: "trello",
  "Google Workspace": "google-workspace",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const course = courses.find((c) => c.id === id);
  return course ? { title: `${course.title}. Ступень`, description: course.summary } : {};
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const course = courses.find((c) => c.id === id);
  if (!course) notFound();
  const tone = tones[course.id];

  const facts = [
    { label: "Длительность", value: course.duration },
    { label: "Расписание", value: course.schedule },
    { label: "Формат", value: course.format },
  ];

  return (
    <>
      <SiteHeader />
      <main className="flex flex-col gap-3 pb-3">
        <section className="on-dark relative -mt-16 overflow-hidden rounded-b-panel bg-[#0e0e10] pt-16 text-white">
          <div
            className="absolute inset-y-0 right-0 w-full md:w-1/2"
            style={{ background: `radial-gradient(90% 90% at 70% 70%, ${tone.glow} 0%, transparent 75%)` }}
          >
            <Image
              src={course.image}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className={`object-cover ${course.image.startsWith("/") ? "" : "opacity-80 mix-blend-luminosity"}`}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e10] via-[#0e0e10]/85 to-[#0e0e10]/20" />

          <div className={`${container} relative py-16 md:py-24`}>
            <Link href="/#courses" className="text-sm text-white/60 hover:text-white">
              ← Все направления
            </Link>
            <p className={`mt-8 text-sm ${tone.text}`}>курс</p>
            <h1 className="mt-3 max-w-[16ch] text-4xl font-semibold tracking-tight md:text-6xl">{course.title}</h1>
            <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-white/75">{course.summary}</p>

            <dl className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label} className="rounded-card border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                  <dt className="text-sm text-white/60">{f.label}</dt>
                  <dd className="mt-1 text-lg font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>

            <a href="#apply" className={`${btnPrimary} mt-10`}>
              Записаться на пробное занятие
            </a>
          </div>
        </section>

        <section className="panel-in on-dark mx-2 rounded-panel bg-bg py-20 sm:mx-3 md:py-28">
          <div className={container}>
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Чему научитесь</h2>
            </Reveal>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {course.program.map((m, i) => (
                <li key={m.title}>
                  <Reveal delay={i * 0.08} className="h-full rounded-card bg-surface p-6">
                    <p className={`font-mono text-sm ${tone.text}`}>Модуль {i + 1}</p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight">{m.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{m.text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>

            <Reveal className="mt-20">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Программы и приложения</h2>
              <ul className="mt-8 flex flex-wrap gap-2">
                {course.tools.map((t) => (
                  <li key={t} className="flex items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-4 text-[15px]">
                    {toolIcons[t] && (
                      <span className="grid size-8 place-items-center rounded-full bg-white">
                        <Image src={`/tools/${toolIcons[t]}.svg`} alt="" width={18} height={18} unoptimized />
                      </span>
                    )}
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="mt-20 grid gap-12 md:grid-cols-2">
              <Reveal>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Как проходит обучение</h2>
                <ul className="mt-8 grid gap-4">
                  {course.process.map((p, i) => (
                    <li key={p} className="flex gap-4 leading-relaxed text-muted">
                      <span className={`font-mono text-sm ${tone.text}`}>0{i + 1}</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal className="rounded-card bg-surface p-8">
                <h2 className="text-2xl font-semibold tracking-tight">После курса</h2>
                <p className="mt-4 text-lg leading-relaxed text-muted">{course.result}</p>
                <p className="mt-6 text-sm text-muted">
                  {course.duration} · {course.schedule}
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <ApplySection course={course.id} />
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
