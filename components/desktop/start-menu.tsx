"use client";
import { useEffect, useRef, useState } from "react";
import { AboutComputerButton } from "@/components/apps/utility-actions";
import type { SearchEntry } from "@/lib/site-search";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import { DesktopIcon } from "./desktop-icon";
import styles from "./desktop-shell.module.css";

export { sectionIcons } from "@/lib/section-icons";
import { sectionIcons } from "@/lib/section-icons";

export function StartMenu({ onWelcome, onNavigate, searchEntries }: { searchEntries: SearchEntry[]; onWelcome: () => void; onNavigate: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const routes: SearchEntry[] = [{ title: "Welcome", href: "/", summary: "Anthony’s Desktop" }, ...primaryNavigation.map(item => ({ title: item.label, href: item.href, summary: item.summary })), ...secondaryNavigation.map(item => ({ title: item.label, href: item.href, summary: item.summary })), { title: "Gilman", href: "/travellogs/gilman", summary: "Scholarship information and resources" }];
  const terms = query.trim().toLocaleLowerCase().split(/\s+/);
  const results = [...routes, ...searchEntries].filter(item => terms.every(term => `${item.title} ${item.summary}`.toLocaleLowerCase().includes(term)));
  const [open, setOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
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
    <button ref={trigger} id="start-button" className={styles.startButton} aria-label="Start" aria-expanded={open} aria-controls="start-navigation" onClick={() => { setQuery(""); setOpen(!open); }}>
      <span className={styles.orb} aria-hidden="true"><span className={styles.flag}><i/><i/><i/><i/></span></span>
      <span className={styles.mobileStartLabel}>Start</span>
    </button>
    {open && <nav id="start-navigation" aria-label="Start menu" className={styles.startMenu} onKeyDown={event => {
      if (event.target instanceof HTMLInputElement) {
        if (event.key === "ArrowDown" || event.key === "Enter") {
          event.preventDefault();
          const first = event.currentTarget.querySelector<HTMLAnchorElement>("[data-search-results] a");
          if (event.key === "Enter") first?.click(); else first?.focus();
        }
        return;
      }
      if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey && event.key !== " ") {
        event.preventDefault();
        setQuery(event.key);
        searchInput.current?.focus();
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
      const links = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a, button"));
      const current = links.indexOf(document.activeElement as HTMLElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      event.preventDefault();
      links[next]?.focus();
    }}>
      <div className={styles.programs}>
        {query.trim() ? <div data-search-results className={styles.searchResults}>
          <p role="status">{results.length ? `${results.length} results` : "No matching pages or articles"}</p>
          {results.map(item => <Link key={item.href} href={item.href} onNavigate={() => { if (item.href === "/") onWelcome(); else onNavigate(); setOpen(false); }}><DesktopIcon kind={sectionIcons[item.href] ?? (item.href.startsWith("/travellogs") ? "travel" : "journal")} size={24}/><span>{item.title}<small>{item.summary}</small></span></Link>)}
        </div> : <>
        <Link ref={firstLink} href="/" aria-current={pathname === "/" ? "page" : undefined} onNavigate={() => { onWelcome(); trigger.current?.focus(); setOpen(false); }}><DesktopIcon kind="welcome" size={36}/><span>Welcome<small>Anthony&apos;s Desktop</small></span></Link>
        {primaryNavigation.map(({href, label}) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onNavigate={() => { onNavigate(); setOpen(false); }}><DesktopIcon kind={sectionIcons[href]} size={36}/><span>{label}</span></Link>)}
      </>}
      </div>
      <div className={styles.startAside}>
        <Link className={styles.userPortrait} href="/about" aria-label="Anthony’s profile" onNavigate={() => { onNavigate(); setOpen(false); }}><DesktopIcon kind="about" size={54}/></Link>
        <strong>Anthony</strong>
        {secondaryNavigation.map(({href, label}) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onNavigate={() => { onNavigate(); setOpen(false); }}>{label}</Link>)}
        <Link href="/travellogs/gilman" aria-current={pathname === "/travellogs/gilman" ? "page" : undefined} onNavigate={() => { onNavigate(); setOpen(false); }}>Gilman</Link>
        <div className={styles.menuDivider}/>
        <span onClick={() => setOpen(false)}><AboutComputerButton>About This Computer</AboutComputerButton></span>
      </div>
      <div className={styles.startFooter}><label className={styles.startSearch}><span className={styles.searchLabel}>Search pages and articles</span><input ref={searchInput} type="search" aria-label="Search pages and articles" placeholder="Search pages and articles" value={query} onChange={event => setQuery(event.target.value)}/><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><circle cx="6" cy="6" r="4" fill="none" stroke="currentColor"/><path d="m9 9 5 5" stroke="currentColor" strokeWidth="2"/></svg></label></div>
    </nav>}
  </div>;
}
