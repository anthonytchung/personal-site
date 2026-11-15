import { WritingArticle, writingMetadata } from "@/components/content/writing-article";
import { getStaticEntries } from "@/lib/content/writing";

export const ensureStatic = "navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() { return getStaticEntries("journal"); }
export async function generateMetadata({ params }: Props) { return writingMetadata("journal", (await params).slug); }
export default async function Page({ params }: Props) { return <WritingArticle kind="journal" slug={(await params).slug}/>; }
