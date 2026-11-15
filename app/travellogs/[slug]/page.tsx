import { WritingArticle, writingMetadata } from "@/components/content/writing-article";
import { getStaticEntries } from "@/lib/content/writing";

export const ensureStatic = "navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() { return getStaticEntries("travel"); }
export async function generateMetadata({ params }: Props) { return writingMetadata("travel", (await params).slug); }
export default async function Page({ params }: Props) { return <WritingArticle kind="travel" slug={(await params).slug}/>; }
