import Image from "next/image";
import { KanbanIcon, MegaphoneIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./reveal";
import { courses, type Course } from "@/lib/courses";
import { container } from "@/lib/ui";

const byId = Object.fromEntries(courses.map((c) => [c.id, c])) as Record<Course["id"], Course>;

function PhotoCell({ course, className, sizes }: { course: Course; className: string; sizes: string }) {
  return (
    <article className={`relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-card bg-surface-2 p-6 ${className}`}>
      <Image src={course.image} alt="" fill sizes={sizes} className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10]/85 via-[#0d0d10]/35 to-transparent" />
      <div className="relative text-[#f2f2f4]">
        <h3 className="text-2xl font-semibold tracking-tight">{course.title}</h3>
        <p className="mt-2 max-w-[44ch] text-[15px] leading-relaxed text-[#f2f2f4]/85">{course.summary}</p>
        <p className="mt-3 text-sm text-[#f2f2f4]/70">{course.skills.join(", ")}</p>
      </div>
    </article>
  );
}

function TextCell({
  course,
  icon,
  className,
}: {
  course: Course;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <article className={`flex min-h-[220px] flex-col justify-between rounded-card p-6 ${className}`}>
      <span className="text-accent">{icon}</span>
      <div>
        <h3 className="text-xl font-semibold tracking-tight">{course.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{course.summary}</p>
        <p className="mt-3 text-sm text-muted">{course.skills.join(", ")}</p>
      </div>
    </article>
  );
}

export function Courses() {
  return (
    <section id="courses" className={`${container} py-20 md:py-28`}>
      <Reveal className="max-w-[60ch]">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Направления обучения</h2>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Выберите профессию. Если сомневаетесь, ассистент или менеджер помогут сравнить программы.
        </p>
      </Reveal>

      {/* 5 направлений = 5 ячеек: большая слева, две справа, две в нижнем ряду. */}
      <Reveal delay={0.08} className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[230px]">
        <PhotoCell course={byId.web} className="md:col-span-4 md:row-span-2" sizes="(min-width: 768px) 66vw, 100vw" />
        <PhotoCell course={byId.design} className="md:col-span-2" sizes="(min-width: 768px) 33vw, 100vw" />
        <TextCell
          course={byId.marketing}
          icon={<MegaphoneIcon size={28} weight="duotone" />}
          className="bg-accent-soft md:col-span-2"
        />
        <article className="grid min-h-[280px] overflow-hidden rounded-card border border-line bg-surface md:col-span-3 md:min-h-0 md:grid-cols-2">
          <div className="flex flex-col justify-end p-6">
            <h3 className="text-xl font-semibold tracking-tight">{byId.analytics.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{byId.analytics.summary}</p>
            <p className="mt-3 text-sm text-muted">{byId.analytics.skills.join(", ")}</p>
          </div>
          <div className="relative min-h-[180px] bg-surface-2">
            <Image src={byId.analytics.image} alt="" fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover" />
          </div>
        </article>
        <TextCell
          course={byId.management}
          icon={<KanbanIcon size={28} weight="duotone" />}
          className="bg-surface-2 md:col-span-3"
        />
      </Reveal>
    </section>
  );
}
