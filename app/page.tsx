import Link from "next/link";
import { DesktopIcon } from "@/components/desktop/desktop-icon";
import styles from "@/components/desktop/welcome.module.css";

export default function Home() {
  return <div className={styles.welcome}>
    <div className={styles.banner}><DesktopIcon kind="welcome" size={62}/><div><span>WELCOME HOME</span><h1>Hey, I&apos;m Anthony.</h1></div></div>
    <div className={styles.introduction}>
      <p>I build software, explore ideas, and make things for the fun of it.</p>
      <p>Welcome to my little corner of the internet. Pick a folder and have a look around.</p>
    </div>
    <nav className={styles.actions} aria-label="Welcome shortcuts">
      <Link href="/projects"><DesktopIcon kind="projects" size={42}/><span><strong>View Projects</strong><small>Things I&apos;ve built</small></span><span className={styles.chevron} aria-hidden="true">›</span></Link>
      <Link href="/about"><DesktopIcon kind="about" size={42}/><span><strong>About Me</strong><small>The person behind the screen</small></span><span className={styles.chevron} aria-hidden="true">›</span></Link>
      <Link href="/blog"><DesktopIcon kind="journal" size={42}/><span><strong>Read My Journal</strong><small>Thoughts, ideas & discoveries</small></span><span className={styles.chevron} aria-hidden="true">›</span></Link>
    </nav>
    <div className={styles.origin}><p>This desktop is a tribute to the computer that first sparked my interest in technology.</p><Link href="/about#why-windows-7">Why Windows 7? <span aria-hidden="true">→</span></Link></div>
    <div className={styles.status}><span className={styles.statusDot} aria-hidden="true"/>A personal space for building, writing, and exploring.</div>
  </div>;
}
