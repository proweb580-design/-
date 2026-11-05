import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./reveal";
import { courses, type Course } from "@/lib/courses";
import { container } from "@/lib/ui";

// Свой цвет у каждого направления: подпись и навыки текстом, свечение под фото.
export const tones: Record<Course["id"], { text: string; glow: string }> = {
  web: { text: "text-[#5ea8ff]", glow: "#1d4ed8" },
  design: { text: "text-[#a78bfa]", glow: "#6d28d9" },
  marketing: { text: "text-[#fb923c]", glow: "#c2410c" },
  analytics: { text: "text-[#facc15]", glow: "#a16207" },
  management: { text: "text-[#4ade80]", glow: "#15803d" },
};

function CourseCard({ course }: { course: Course }) {
  const tone = tones[course.id];
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-card border border-white/10 bg-[#0e0e10] p-6 text-white transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* Своя иллюстрация показывается как есть; фото-заглушка тонируется цветом направления через luminosity. */}
      <div
        className="absolute inset-x-0 bottom-0 isolate h-[60%] transition-transform duration-700 ease-out group-hover:-translate-y-3 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100"
        style={{ background: `radial-gradient(120% 100% at 50% 100%, ${tone.glow} 0%, transparent 75%)` }}
      >
        <Image src={course.image} alt="" fill sizes="(min-width: 1024px) 20vw, 270px" className={`object-cover ${course.image.startsWith("/") ? "" : "opacity-80 mix-blend-luminosity"}`} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e10] via-[#0e0e10]/60 via-45% to-transparent" />

      <div className="relative">
        <p className={`text-sm ${tone.text}`}>курс</p>
        <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">{course.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{course.summary}</p>
        <p className={`mt-3 text-sm ${tone.text}`}>{course.skills.join(", ")}</p>
      </div>
      <span className="relative mt-auto self-start rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-md transition-colors group-hover:bg-white/20">
        Подробнее →
      </span>
    </Link>
  );
}

export function Courses() {
  return (
    <section id="courses" className="panel-in on-dark mx-2 rounded-panel bg-bg py-20 sm:mx-3 md:py-28">
      <div className={container}>
        <Reveal className="mx-auto max-w-[60ch] text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Направления обучения</h2>
          <p className="mt-3 text-base font-medium text-fg md:text-lg">Более 15 образовательных программ</p>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Выберите профессию. Если сомневаетесь, ассистент или менеджер помогут сравнить программы.
          </p>
        </Reveal>

        {/* До lg карточки листаются по горизонтали, на широком экране стоят в один ряд. */}
        <div className="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0">
          {courses.map((course, i) => (
            <Reveal key={course.id} delay={i * 0.08} className="w-[270px] shrink-0 snap-start lg:w-auto">
              <CourseCard course={course} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
