import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = { title: "Resume", description: "Resume preview and download." };

export default function Page() {
  return (
    <ContentPage title="Resume" icon="resume" status="Resume information">
      <p>My resume will be available here soon.</p>
    </ContentPage>
  );
}
