import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = { title: "Journal", description: "Personal thoughts, technical writing, and things worth sharing." };

export default function Page() {
  return (
    <ContentPage title="Journal">
      <p>Journal entries are coming soon.</p>
    </ContentPage>
  );
}
