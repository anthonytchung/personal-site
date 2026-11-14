import type { ReactNode } from "react";
import styles from "./content.module.css";

export function ContentPage({ title, children }: { title: string; children: ReactNode }) {
  return <div className={styles.content}><h1>{title}</h1>{children}</div>;
}
