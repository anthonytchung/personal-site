import Link from "next/link";
import { DesktopIcon } from "@/components/desktop/desktop-icon";
import styles from "@/components/desktop/welcome.module.css";

export default function Home() {
  return <div className={styles.welcome}>
    <div className={styles.banner}><DesktopIcon kind="welcome" size={42}/><h1>Hey, I&apos;m Anthony.</h1></div>
    <div className={styles.introduction}>
      <p>I build software, explore ideas, and make things for the fun of it.</p>
    </div>
    <nav className={styles.actions} aria-label="Welcome shortcuts">
      <Link href="/projects"><DesktopIcon kind="projects" size={30}/><strong>View Projects</strong><span className={styles.chevron} aria-hidden="true">›</span></Link>
      <Link href="/about"><DesktopIcon kind="about" size={30}/><strong>About Me</strong><span className={styles.chevron} aria-hidden="true">›</span></Link>
      <Link href="/blog"><DesktopIcon kind="journal" size={30}/><strong>Read My Journal</strong><span className={styles.chevron} aria-hidden="true">›</span></Link>
    </nav>
    <div className={styles.origin}><Link href="/about#why-windows-7">Why Windows 7? <span aria-hidden="true">→</span></Link></div>
  </div>;
}
