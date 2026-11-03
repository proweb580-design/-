import { ApplySection } from "@/components/apply-section";
import { AssistantSection } from "@/components/assistant-section";
import { ChatWidget } from "@/components/chat-widget";
import { Courses } from "@/components/courses";
import { Faq } from "@/components/faq";
import { Hero } from "@/components/hero";
import { LearningPath } from "@/components/learning-path";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col gap-3 pb-3">
        <Hero />
        <Courses />
        <LearningPath />
        <AssistantSection />
        <Faq />
        <ApplySection />
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
