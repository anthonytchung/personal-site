"use client";
import Link from "next/link";
import type { MouseEvent } from "react";
import { DesktopIcon } from "@/components/desktop/desktop-icon";
import styles from "./about-computer.module.css";

export function AboutComputer({ onAbout, onClose }: { onAbout: () => void; onClose: () => void }) {
  function revealSection(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document.getElementById(event.currentTarget.hash.slice(1))?.scrollIntoView({ block: "nearest" });
  }
  return <div className={styles.system}>
    <div className={styles.location}>System <span aria-hidden="true">›</span> About This Computer</div>
    <div className={styles.layout}>
      <nav className={styles.sidebar} aria-label="About This Computer sections">
        <a href="#computer-edition" onClick={revealSection}>Personal edition</a>
        <a href="#computer-information" onClick={revealSection}>System information</a>
        <a href="#computer-origin" onClick={revealSection}>Where it started</a>
        <Link href="/about" onNavigate={onAbout}>About Anthony</Link>
      </nav>
      <div className={styles.details}>
        <h1>View basic information about this desktop</h1>
        <section id="computer-edition">
          <h2>Personal edition</h2>
          <div className={styles.edition}><div><strong>Anthony&apos;s Desktop</strong><p>Personal Edition</p><p>A personal space for building, writing, and exploring.</p></div><DesktopIcon kind="welcome" size={92}/></div>
        </section>
        <section id="computer-information">
          <h2>System information</h2>
          <dl><dt>Computer name:</dt><dd>Anthony&apos;s Desktop</dd><dt>Owner:</dt><dd>Anthony</dd><dt>First inspiration:</dt><dd>The family Windows 7 computer</dd></dl>
          <p className={styles.caption}>A few nonliteral specifications, just for fun:</p>
          <dl><dt>Power source:</dt><dd>Curiosity</dd><dt>Nostalgia:</dt><dd>Enabled</dd></dl>
        </section>
        <section id="computer-origin">
          <h2>Where it started</h2>
          <p>My interest in technology began at home, watching my father use our family Windows 7 computer. He seemed like a wizard in navigating the web and using this magical technology. This curiosity led me to pursue software and learning sciences later on.</p>
          <p>This desktop is a tribute to the computer that started it all, and to that early curiosity.</p>
          <Link href="/about" onNavigate={onAbout}>Read more about Anthony</Link>
        </section>
        <button className={styles.returnButton} onClick={onClose}>Return to the website</button>
      </div>
    </div>
  </div>;
}
