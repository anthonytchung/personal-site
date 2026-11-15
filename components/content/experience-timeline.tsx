import type { ExperienceEntry } from "@/content/experience";
import styles from "./experience.module.css";

export function ExperienceTimeline({ entries }: { entries: readonly ExperienceEntry[] }) {
  if (entries.length === 0) return <p>Professional history is still being prepared.</p>;

  return <ol className={styles.timeline} aria-label="Experience timeline">
    {entries.map(entry => <li key={entry.id} className={styles.item}>
      <article className={styles.card} aria-labelledby={`experience-${entry.id}`}>
        {entry.status === "placeholder" && <p className={styles.placeholder}>Development placeholder · Not an employment record</p>}
        <p className={styles.dates}>{entry.dates}</p>
        <h2 id={`experience-${entry.id}`}>{entry.role}</h2>
        <p className={styles.employer}>{entry.employer}</p>
        <p className={styles.location}>{entry.location}</p>
        <p>{entry.description}</p>
        {entry.accomplishments.length > 0 && <section aria-labelledby={`accomplishments-${entry.id}`}>
          <h3 id={`accomplishments-${entry.id}`}>{entry.status === "placeholder" ? "Key accomplishments to be added" : "Key accomplishments"}</h3>
          <ul>{entry.accomplishments.map(accomplishment => <li key={accomplishment}>{accomplishment}</li>)}</ul>
        </section>}
      </article>
    </li>)}
  </ol>;
}
