import Link from "next/link";
import Image from "next/image";
import { getEntries } from "@/lib/content/writing";
import { formatDate, writingSections, type WritingKind } from "@/lib/content/metadata";
import styles from "./writing.module.css";
import { ExplorerLayout } from "./explorer-layout";

export async function WritingArchive({ kind }: { kind: WritingKind }) {
  const entries = await getEntries(kind);
  const section = writingSections[kind];
  return <ExplorerLayout title={section.title} sectionHref={section.href} icon={kind === "journal" ? "journal" : "travel"}
    toolbar={kind === "travel" ? <Link href="/travellogs/gilman">Gilman Scholarship</Link> : undefined}
    status={`${entries.length} published ${entries.length === 1 ? "entry" : "entries"}`}>
    <div className={styles.archive} data-kind={kind}>
    <header className={styles.archiveHeader}>
      <p className={styles.eyebrow}>{kind === "journal" ? "Writing archive" : "Places & perspectives"}</p>
      <h1>{section.title}</h1><p>{section.summary}</p>
    </header>
    {entries.length === 0 ? <p className={styles.empty}>No {kind === "journal" ? "journal" : "travel"} entries published yet.</p> :
      <ul className={styles.entries}>{entries.map(entry => <li key={entry.slug}>
        <article className={styles.card}>
          {entry.cover && <Image className={styles.cover} {...entry.cover} alt={entry.cover.alt} sizes="(max-width: 700px) 90vw, 650px"/>}
          <div className={styles.cardBody}>
            <p className={styles.date}><time dateTime={entry.date}>{formatDate(entry.date)}</time></p>
            <h2><Link href={`${section.href}/${entry.slug}`}>{entry.title}</Link></h2>
            {entry.kind === "travel" && <p className={styles.destination}>{entry.destination} · {formatDate(entry.travelDates.start)} – {formatDate(entry.travelDates.end)}</p>}
            <p>{entry.summary}</p>
            {entry.categories.length > 0 && <ul className={styles.tags} aria-label="Categories">{entry.categories.map(category => <li key={category}>{category}</li>)}</ul>}
          </div>
        </article>
      </li>)}</ul>}
    </div>
  </ExplorerLayout>;
}
