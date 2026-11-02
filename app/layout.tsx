import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ступень. Учебный центр digital-профессий",
  description:
    "Курсы по веб-разработке, UX/UI-дизайну, интернет-маркетингу, аналитике данных и управлению проектами. AI-ассистент ответит на вопросы о курсах.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d10" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-[100dvh] bg-bg font-sans text-fg antialiased">{children}</body>
    </html>
  );
}
