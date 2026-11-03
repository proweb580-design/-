import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-onest", display: "swap" });

export const metadata: Metadata = {
  title: "Ступень. Учебный центр digital-профессий",
  description:
    "Курсы по веб-разработке, UX/UI-дизайну, интернет-маркетингу, аналитике данных и управлению проектами. AI-ассистент ответит на вопросы о курсах.",
};

export const viewport: Viewport = {
  themeColor: "#f3eee8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} ${GeistMono.variable}`}>
      <body className="min-h-[100dvh] bg-ink font-sans text-fg antialiased">{children}</body>
    </html>
  );
}
