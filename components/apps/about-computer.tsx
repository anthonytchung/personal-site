"use client";
import { DesktopIcon } from "@/components/desktop/desktop-icon";
import styles from "./about-computer.module.css";

export function AboutComputer({ onClose }: { onClose: () => void }) {
  return <div className={styles.system}>
    <h1>System information</h1>
    <section>
      <h2>Personal edition</h2>
      <div className={styles.edition}><div><strong>Anthony&apos;s Desktop</strong><p>Personal Edition</p></div><DesktopIcon kind="welcome" size={80}/></div>
    </section>
    <section>
      <h2>System</h2>
      <dl>
        <dt>Computer name:</dt><dd>Anthony&apos;s Desktop</dd>
        <dt>Owner:</dt><dd>Anthony</dd>
        <dt>First inspiration:</dt><dd>The family Windows 7 computer</dd>
        <dt>Power source:</dt><dd>Curiosity</dd>
        <dt>Nostalgia:</dt><dd>Enabled</dd>
      </dl>
    </section>
    <section>
      <h2>Where it started</h2>
      <p>My interest in technology began at home, watching my father use our family Windows 7 computer. He seemed like a wizard navigating the web. That curiosity led me to pursue software and learning sciences.</p>
    </section>
    <button className={styles.returnButton} onClick={onClose}>Close</button>
  </div>;
}
