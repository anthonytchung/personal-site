import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = { title: "Experience", description: "Professional history and experience." };

export default function Page() {
  return (
    <ContentPage title="Experience" status="Professional history">
      <p>My professional history is coming soon.</p>
    </ContentPage>
  );
}
