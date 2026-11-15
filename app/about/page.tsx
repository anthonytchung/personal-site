import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = { title: "About", description: "Biography, interests, and personal background." };

export default function Page() {
  return (
    <ContentPage title="About" icon="about" status="Biography & background">
      <p>I build software, explore ideas, and make things for the fun of it.</p>
      <section id="why-windows-7" style={{ scrollMarginTop: "2rem" }}>
        <h2>Why Windows 7?</h2>
        <p>Watching my father work on our family Windows 7 computer sparked my curiosity about technology. That curiosity eventually led me to learn to develop software.</p>
        <p>This website is a tribute to that first computer: a familiar desktop, with my own projects, writing, and travels inside.</p>
      </section>
    </ContentPage>
  );
}
