import { Logo } from "./logo";
import { btnPrimary, container } from "@/lib/ui";

const links = [
  { href: "#courses", label: "Направления" },
  { href: "#path", label: "Обучение" },
  { href: "#assistant", label: "Ассистент" },
  { href: "#faq", label: "Вопросы" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/85 backdrop-blur-md">
      <div className={`${container} flex h-16 items-center justify-between gap-6`}>
        <a href="#top" aria-label="Ступень, на главную">
          <Logo />
        </a>
        <nav aria-label="Разделы" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-[15px] text-muted transition-colors hover:text-fg">
              {link.label}
            </a>
          ))}
        </nav>
        <a href="#apply" className={`${btnPrimary} h-10 px-4`}>
          Записаться
        </a>
      </div>
    </header>
  );
}
