import type { ReactNode } from "react";
import Link from "next/link";
import { DesktopIcon } from "@/components/desktop/desktop-icon";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import styles from "./projects-explorer.module.css";

export function ProjectsExplorer({ children }: { children: ReactNode }) {
  return (
    <div className={styles.explorer}>
      <div className={styles.addressBar}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <DesktopIcon kind="projects" size={22}/>
          <ol>
            <li><span aria-current="page">Projects</span></li>
          </ol>
        </nav>
      </div>
      <div className={styles.commandBar}>
        <span>Project library</span>
        <span>Software &amp; experiments</span>
      </div>
      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Explorer navigation">
          <nav aria-labelledby="explorer-library">
            <h2 id="explorer-library">Anthony&apos;s Desktop</h2>
            {primaryNavigation.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={href === "/projects" ? "page" : undefined}>
                {label}
              </Link>
            ))}
          </nav>
          <nav aria-label="More about Anthony">
            <h2>More about Anthony</h2>
            {secondaryNavigation.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
        </aside>
        <main id="main-content" tabIndex={-1} className={styles.main}>{children}</main>
      </div>
      <div className={`status-bar ${styles.statusBar}`}>
        <p className="status-bar-field">0 projects</p>
        <p className="status-bar-field">Project library</p>
      </div>
    </div>
  );
}
