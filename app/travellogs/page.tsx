import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = { title: "Travel Logs", description: "Travel writing, study abroad reflections, and photographs." };

export default function Page() {
  return (
    <ContentPage title="Travel Logs">
      <p>Travel entries are coming soon.</p>
      <p><Link href="/travellogs/gilman">Gilman Scholarship</Link></p>
    </ContentPage>
  );
}
