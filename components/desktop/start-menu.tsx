"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import { DesktopIcon, type IconKind } from "./desktop-icon";
import styles from "./desktop-shell.module.css";

export const sectionIcons: Record<string, IconKind> = {
  "/projects": "projects", "/blog": "journal", "/travellogs": "travel", "/about": "about", "/resume": "resume",
};

export function StartMenu({ onWelcome }: { onWelcome: () => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function keyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keyboard);
    };
  }, [open]);
  return <div ref={root} className={styles.startRoot} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }}>
    <button ref={trigger} id="start-button" className={styles.startButton} aria-label="Start" aria-expanded={open} aria-controls="start-navigation" onClick={() => setOpen(!open)}>
      <span className={styles.orb} aria-hidden="true"><span className={styles.flag}><i/><i/><i/><i/></span></span>
      <span className={styles.mobileStartLabel}>Start</span>
    </button>
    {open && <nav id="start-navigation" aria-label="Start menu" className={styles.startMenu}>
      <div className={styles.programs}>
        <Link ref={firstLink} href="/" onClick={() => { onWelcome(); trigger.current?.focus(); setOpen(false); }}><DesktopIcon kind="welcome" size={36}/><span>Welcome<small>Anthony&apos;s Desktop</small></span></Link>
        {primaryNavigation.map(({href, label}) => <Link key={href} href={href} onClick={() => setOpen(false)}><DesktopIcon kind={sectionIcons[href]} size={36}/><span>{label}</span></Link>)}
      </div>
      <div className={styles.startAside}>
        <div className={styles.userPortrait}><DesktopIcon kind="about" size={54}/></div>
        <strong>Anthony</strong>
        {secondaryNavigation.map(({href, label}) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/travellogs/gilman" onClick={() => setOpen(false)}>Gilman</Link>
        <div className={styles.menuDivider}/>
        <Link href="/about#why-windows-7" onClick={() => setOpen(false)}>Why Windows 7?</Link>
      </div>
      <div className={styles.startFooter}>A little nostalgia. A lot to explore.</div>
    </nav>}
  </div>;
}
