import Image from "next/image";
import { btnPrimary, btnSecondary, container } from "@/lib/ui";

export function Hero() {
  return (
    <section id="top" className={`${container} grid items-center gap-10 pb-16 pt-10 md:min-h-[calc(100dvh-4rem)] md:grid-cols-[7fr_5fr] md:gap-14 md:pb-20 md:pt-12`}>
      <div>
        <h1 className="rise text-4xl font-semibold leading-[1.05] tracking-tight lg:text-[3.5rem]">
          Освойте профессию в digital
        </h1>
        <p className="rise mt-6 max-w-[46ch] text-lg leading-relaxed text-muted [animation-delay:80ms]">
          Курсы по разработке, дизайну, маркетингу и аналитике. Учитесь с наставником на реальных задачах и собирайте портфолио.
        </p>
        <div className="rise mt-9 flex flex-wrap gap-3 [animation-delay:160ms]">
          <a href="#apply" className={btnPrimary}>
            Записаться
          </a>
          <a href="#assistant" className={btnSecondary}>
            Спросить ассистента
          </a>
        </div>
      </div>

      {/* TODO: заменить на реальное фото занятия в центре, 1200x1500 */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface-2 md:aspect-[5/6]">
        <Image
          src="https://picsum.photos/seed/stupen-classroom-students/1200/1440"
          alt="Занятие в учебном центре"
          fill
          priority
          sizes="(min-width: 768px) 42vw, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
