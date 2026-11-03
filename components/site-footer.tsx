import { Logo } from "./logo";
import { container } from "@/lib/ui";

export function SiteFooter() {
  return (
    <footer className="on-dark py-10">
      <div className={`${container} flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <Logo />
          <p className="mt-2 text-sm text-muted">Учебный центр digital-профессий</p>
        </div>
        <nav aria-label="Разделы в подвале" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <a href="#courses" className="hover:text-fg">Направления</a>
          <a href="#assistant" className="hover:text-fg">Ассистент</a>
          <a href="#faq" className="hover:text-fg">Вопросы</a>
          <a href="#apply" className="hover:text-fg">Записаться</a>
        </nav>
        <p className="text-sm text-muted">© {new Date().getFullYear()} Ступень</p>
      </div>
    </footer>
  );
}
