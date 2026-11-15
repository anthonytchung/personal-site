import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";
import { ExperienceTimeline } from "@/components/content/experience-timeline";
import { experienceEntries } from "@/content/experience";

export const metadata: Metadata = { title: "Experience", description: "Professional history and experience." };

export default function Page() {
  return (
    <ContentPage title="Experience" status="Professional history">
      <p>A place for the work: roles, responsibilities, and the contributions made along the way.</p>
      {experienceEntries.some(entry => entry.status === "placeholder") && <p>Entries labeled as development placeholders preview how each role will be presented. They are not employment records.</p>}
      <ExperienceTimeline entries={experienceEntries} />
    </ContentPage>
  );
}
