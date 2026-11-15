import type { Metadata } from "next";
import { DesktopIcon } from "@/components/desktop/desktop-icon";
import styles from "@/components/content/projects-explorer.module.css";

export const metadata: Metadata = { title: "Projects", description: "Software projects and technical case studies." };

export default function Page() {
  return (
    <>
      <header className={styles.heading}>
        <DesktopIcon kind="projects" size={48}/>
        <div><h1>Projects</h1><p>A collection of software, experiments, and things I&apos;ve built.</p></div>
      </header>
      <section className={styles.empty} aria-labelledby="projects-empty">
        <h2 id="projects-empty">This folder is waiting for its first project.</h2>
        <p>Project highlights and case studies are coming soon. In the meantime, explore my background, journal, and travel logs using the navigation.</p>
      </section>
    </>
  );
}
