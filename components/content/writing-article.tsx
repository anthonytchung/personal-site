import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntry } from "@/lib/content/writing";
import { formatDate, writingSections, type WritingKind } from "@/lib/content/metadata";
import styles from "./writing.module.css";
import { PhotoGallery } from "./photo-gallery";
import { ExplorerLayout } from "./explorer-layout";

export async function writingMetadata(kind: WritingKind, slug: string): Promise<Metadata> {
  const entry = await getEntry(kind, slug);
  if (!entry) notFound();
  const url = `https://anthonychung.me${writingSections[kind].href}/${entry.slug}`;
  const images = entry.cover ? [{ ...entry.cover, url: entry.cover.src }] : undefined;
  return {
    title: entry.title, description: entry.summary, alternates: { canonical: url },
    openGraph: { type: "article", title: entry.title, description: entry.summary, url, publishedTime: entry.date, tags: entry.categories, images },
    twitter: { card: entry.cover ? "summary_large_image" : "summary", title: entry.title, description: entry.summary, images: entry.cover ? [entry.cover.src] : undefined },
  };
}

export async function WritingArticle({ kind, slug }: { kind: WritingKind; slug: string }) {
  const entry = await getEntry(kind, slug);
  if (!entry) notFound();
  const section = writingSections[kind];
  const { Content } = entry;
  return <ExplorerLayout title={entry.title} sectionHref={section.href} icon={kind === "journal" ? "journal" : "travel"}
    parents={[{ title: section.title, href: section.href }]}
    toolbar={<Link href={section.href}>← Back to {section.title}</Link>}
    status={`Published ${formatDate(entry.date)}`}>
    <article className={styles.article} data-kind={kind}>
    <header className={styles.articleHeader}>
      <p className={styles.eyebrow}>{section.title}</p>
      <h1>{entry.title}</h1>
      <p className={styles.date}><time dateTime={entry.date}>{formatDate(entry.date)}</time></p>
      {entry.kind === "travel" && <p className={styles.destination}>{entry.destination} · {formatDate(entry.travelDates.start)} – {formatDate(entry.travelDates.end)}</p>}
      <p className={styles.summary}>{entry.summary}</p>
      {entry.categories.length > 0 && <ul className={styles.tags} aria-label="Categories">{entry.categories.map(category => <li key={category}>{category}</li>)}</ul>}
    </header>
    {entry.cover && <Image className={styles.hero} {...entry.cover} alt={entry.cover.alt} sizes="(max-width: 700px) 90vw, 750px" loading="eager"/>}
    <div className={styles.prose}><Content components={{
      PhotoGallery,
      img: ({ src, alt, width, height }) => <Image src={src ?? ""} alt={alt ?? ""} width={Number(width) || 1600} height={Number(height) || 1000} unoptimized className={styles.inlineImage}/>,
      a: ({ href, children, ...props }) => href ? <Link href={href} {...props}>{children}</Link> : <a {...props}>{children}</a>,
    }}/></div>
    {kind === "travel" && <nav className={styles.articleFooter} aria-label="Article navigation"><Link href="/travellogs/gilman">Gilman Scholarship</Link></nav>}
    </article>
  </ExplorerLayout>;
}
