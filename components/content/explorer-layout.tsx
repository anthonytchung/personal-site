import type { ReactNode } from "react";
import Link from "next/link";
import { DesktopIcon, type IconKind } from "@/components/desktop/desktop-icon";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import styles from "./explorer-layout.module.css";

type Props = {
  children: ReactNode;
  title: string;
  sectionHref: string;
  icon?: IconKind;
  parents?: readonly { title: string; href: string }[];
  toolbar?: ReactNode;
  status: ReactNode;
};

// Server-rendered route chrome is passed through the persistent primary window.
// Titles and parents come from real page metadata, never inferred from slugs.
export function ExplorerLayout({ children, title, sectionHref, icon = "welcome", parents = [], toolbar, status }: Props) {
  return <div className={styles.explorer}>
    <div className={styles.addressBar}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <DesktopIcon kind={icon} size={22}/>
        <ol>
          {parents.map(parent => <li key={parent.href}><Link href={parent.href}>{parent.title}</Link></li>)}
          <li><span aria-current="page">{title}</span></li>
        </ol>
      </nav>
    </div>
    {toolbar && <div className={styles.commandBar} role="group" aria-label="Section tools">{toolbar}</div>}
    <div className={styles.body}>
      <aside className={styles.sidebar} aria-label="Explorer navigation">
        <nav aria-label="Sections">
          {primaryNavigation.map(({ href, label }) => <Link key={href} href={href} aria-current={href === sectionHref ? "page" : undefined}>{label}</Link>)}
        </nav>
        <nav aria-label="More about Anthony">
          <h2>More about Anthony</h2>
          {secondaryNavigation.map(({ href, label }) => <Link key={href} href={href} aria-current={href === sectionHref ? "page" : undefined}>{label}</Link>)}
        </nav>
      </aside>
      <main id="main-content" tabIndex={-1} className={styles.main}>{children}</main>
    </div>
    <div className={`status-bar ${styles.statusBar}`} role="group" aria-label="Section information">
      <p className="status-bar-field">{status}</p>
    </div>
  </div>;
}
