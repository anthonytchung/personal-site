import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";
import Link from "next/link";

export const metadata: Metadata = { title: "Gilman", description: "Scholarship reflections and resources for prospective students." };

export default function Page() {
  return (
    <ContentPage title="Gilman" icon="travel" sectionHref="/travellogs" parents={[{ title: "Travel Logs", href: "/travellogs" }]} toolbar="Scholarship information" status="Scholarship information & resources">
      <p>Gilman reflections and resources are coming soon.</p>
      <p><Link href="/travellogs">Back to Travel Logs</Link></p>
    </ContentPage>
  );
}
