import type { ReactNode } from "react";
import Link from "next/link";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import styles from "./content.module.css";

export function ExplorerLayout({ children }: { children: ReactNode }) {
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
