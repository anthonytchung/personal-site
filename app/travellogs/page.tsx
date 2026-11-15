import type { Metadata } from "next";
import { WritingArchive } from "@/components/content/writing-archive";
import { writingSections } from "@/lib/content/metadata";

const section = writingSections.travel;
export const metadata: Metadata = {
  title: section.title, description: section.summary,
  alternates: { canonical: section.href },
  openGraph: { title: section.title, description: section.summary, url: section.href, type: "website" },
};

export default function Page() { return <WritingArchive kind="travel"/>; }
