import type { ReactNode } from "react";
import Link from "next/link";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import styles from "./content.module.css";
import { ProjectsExplorer } from "./projects-explorer";

export function ExplorerLayout({ children, pathname }: { children: ReactNode; pathname: string }) {
  if (pathname === "/projects") return <ProjectsExplorer>{children}</ProjectsExplorer>;

  const section = [...primaryNavigation, ...secondaryNavigation].find(({ href }) => href === pathname);
  // Only the existing nested content page has a parent breadcrumb today.
  const gilman = pathname === "/travellogs/gilman";

  return (
    <div className={styles.explorer}>
      {(section || gilman) && <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <ol>
          {gilman && <li><Link href="/travellogs">Travel Logs</Link></li>}
          <li><span aria-current="page">{gilman ? "Gilman" : section?.label}</span></li>
        </ol>
      </nav>}
      <nav className={styles.navigation} aria-label="Main navigation">
        {primaryNavigation.map(({ href, label }) => <Link key={href} href={href} aria-current={href === pathname ? "page" : undefined}>{label}</Link>)}
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
