/** Направления обучения. Тексты примерные: заменить данными центра. */
export interface Course {
  id: "web" | "design" | "marketing" | "analytics" | "management";
  title: string;
  summary: string;
  skills: string[];
  image: string;
}

export const courses: Course[] = [
  {
    id: "web",
    title: "Веб-разработка",
    summary: "От первой вёрстки до приложения на React с сервером и базой данных.",
    skills: ["HTML и CSS", "JavaScript", "React", "Node.js"],
    image: "/courses/web.png",
  },
  {
    id: "design",
    title: "UX/UI-дизайн",
    summary: "Исследования, прототипы и интерфейсы в Figma.",
    skills: ["Figma", "Прототипы", "UX-исследования"],
    image: "/courses/design.png",
  },
  {
    id: "marketing",
    title: "Интернет-маркетинг",
    summary: "Таргет, контент и аналитика рекламы в соцсетях.",
    skills: ["SMM", "Таргетинг", "Контент-план"],
    image: "https://picsum.photos/seed/stupen-marketing-team/900/700",
  },
  {
    id: "analytics",
    title: "Аналитика данных",
    summary: "Таблицы, SQL и дашборды для решений в бизнесе.",
    skills: ["Excel", "SQL", "Python", "Дашборды"],
    image: "/courses/analytics.png",
  },
  {
    id: "management",
    title: "Управление проектами",
    summary: "Планирование, работа с командой и запуск digital-продуктов.",
    skills: ["Agile", "Scrum", "Jira"],
    image: "/courses/management.png",
  },
];

export const LEAD_COURSE_IDS = [...courses.map((c) => c.id), "unsure"] as const;
