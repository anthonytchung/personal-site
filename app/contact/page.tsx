import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = { title: "Contact", description: "Contact details and social links." };

export default function Page() {
  return (
    <ContentPage title="Contact">
      <p>Contact details are coming soon.</p>
    </ContentPage>
  );
}
