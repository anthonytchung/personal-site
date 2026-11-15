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
      <p className={styles.empty}>No projects to display yet.</p>
    </>
  );
}
