import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = { title: "Projects", description: "Software projects and technical case studies." };

export default function Page() {
  return (
    <ContentPage title="Projects">
      <p>Project case studies are coming soon.</p>
    </ContentPage>
  );
}
