import { Fragment } from "react";
import { DotHands } from "./dot-hands";
import { btnPrimary, btnSecondary, container } from "@/lib/ui";

const TITLE = "Освойте профессию в digital";

export function Hero() {
  return (
    // -mt-16 заводит фон под прозрачную шапку.
    <section id="top" className="relative -mt-16 overflow-hidden rounded-b-panel bg-bg pt-16">
      <DotHands />

      <div className={`${container} relative flex min-h-[calc(100dvh-3rem)] flex-col justify-between gap-16 pb-20 pt-6 md:pt-8`}>
        <div className="flex flex-col items-center text-center">
          <h1 data-quiet className="max-w-[14ch] text-4xl font-bold leading-[0.95] tracking-[-0.04em] text-fg sm:text-5xl lg:text-[4.5rem]">
            {TITLE.split(" ").map((word, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                {/* Слово выезжает из-под маски; запас снизу, чтобы маска не срезала «р» и «ф». */}
                <span className="-mb-[0.15em] inline-block overflow-hidden pb-[0.15em] align-top">
                  <span className="word-up inline-block" style={{ animationDelay: `${i * 90}ms` }}>
                    {word}
                  </span>
                </span>
              </Fragment>
            ))}
          </h1>
          <div data-quiet className="rise mt-9 flex flex-wrap justify-center gap-3 [animation-delay:380ms]">
            <a href="#apply" className={`${btnPrimary} group`}>
              Записаться
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
            <a href="#assistant" className={btnSecondary}>
              Спросить ассистента
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
