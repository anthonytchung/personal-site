import type { ReactNode } from "react";
import Link from "next/link";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import styles from "./content.module.css";
import { ProjectsExplorer } from "./projects-explorer";

export function ExplorerLayout({ children, pathname }: { children: ReactNode; pathname: string }) {
  if (pathname === "/projects") return <ProjectsExplorer>{children}</ProjectsExplorer>;

  return (
    <div className={styles.explorer}>
      <nav className={styles.navigation} aria-label="Main navigation">
        <Link href="/">Desktop</Link>
        {primaryNavigation.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <div className={styles.body}>
        <nav className={styles.secondary} aria-label="More about Anthony">
          {secondaryNavigation.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <main id="main-content" tabIndex={-1} className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
