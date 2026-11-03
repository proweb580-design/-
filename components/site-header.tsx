import { HeaderShell } from "./header-shell";
import { Logo } from "./logo";
import { btnSecondary, container } from "@/lib/ui";

const links = [
  { href: "#courses", label: "Направления" },
  { href: "#path", label: "Обучение" },
  { href: "#assistant", label: "Ассистент" },
  { href: "#faq", label: "Вопросы" },
];

export function SiteHeader() {
  return (
    <HeaderShell>
      <div className={`${container} flex h-16 items-center justify-between gap-4`}>
        <a href="#top" aria-label="Ступень, на главную" className="rounded-full bg-surface/80 px-4 py-2 backdrop-blur-md">
          <Logo />
        </a>
        <nav aria-label="Разделы" className="hidden items-center gap-1 rounded-full bg-surface/90 p-1.5 backdrop-blur-md md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a href="#apply" className={`${btnSecondary} h-10 px-5`}>
          Записаться
        </a>
      </div>
    </HeaderShell>
  );
}
