import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = { title: "Gilman", description: "Scholarship reflections and resources for prospective students." };

export default function Page() {
  return (
    <ContentPage title="Gilman">
      <p>Gilman reflections and resources are coming soon.</p>
    </ContentPage>
  );
}
