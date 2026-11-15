"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PrimaryWindow } from "@/components/windows/primary-window";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import { DesktopIcon } from "./desktop-icon";
import { StartMenu, sectionIcons } from "./start-menu";
import { SystemClock } from "./system-clock";
import { setWelcomeDismissed, useWelcomeDismissed } from "./welcome-session";
import styles from "./desktop-shell.module.css";

const shortcutOrder = ["/projects", "/blog", "/travellogs", "/about", "/resume"];
const sections = [...primaryNavigation, ...secondaryNavigation];

export function DesktopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const home = pathname === "/";
  const dismissed = useWelcomeDismissed();
  const [visibility, setVisibility] = useState({ pathname, minimized: false });
  const [maximized, setMaximized] = useState(false);
  const [previewDismissed, setPreviewDismissed] = useState(false);

  useEffect(() => {
    function dismissPreview(event: KeyboardEvent) {
      if (event.key === "Escape") setPreviewDismissed(true);
    }
    document.addEventListener("keydown", dismissPreview);
    return () => document.removeEventListener("keydown", dismissPreview);
  }, []);

  // Reset only presentation state on a committed route change, including history.
  // The URL still owns content; the shell and window geometry never remount.
  if (visibility.pathname !== pathname) {
    setVisibility({ pathname, minimized: false });
  }
  const minimized = visibility.pathname === pathname && visibility.minimized;
  const section = sections.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const label = home ? "Welcome" : pathname === "/travellogs/gilman" ? "Gilman" : section?.label ?? "Anthony's Desktop";
  const summary = home ? "Meet Anthony and explore the site" : pathname === "/travellogs/gilman" ? "Scholarship information and resources" : section?.summary ?? "Website content";
  const title = home ? "Welcome to Anthony's Desktop" : label;
  const icon = section ? sectionIcons[section.href] ?? "welcome" : "welcome";

  function restoreWindow() {
    setVisibility({ pathname, minimized: false });
    focusContent();
  }
  function focusContent() {
    const origin = document.activeElement;
    requestAnimationFrame(() => {
      // Do not steal focus if the visitor has already chosen another control.
      if (document.activeElement !== origin && document.activeElement !== document.body) return;
      const main = Array.from(document.querySelectorAll<HTMLElement>("#primary-window main"))
        .find(element => element.getClientRects().length > 0);
      main?.focus({ preventScroll: true });
    });
  }
  function restoreWelcome() {
    setWelcomeDismissed(false);
    restoreWindow();
  }
  function minimizeWindow() {
    setVisibility({ pathname, minimized: true });
    document.getElementById("primary-task")?.focus();
  }
  function closeWindow() {
    if (home) setWelcomeDismissed(true);
    else router.push("/");
    document.getElementById("start-button")?.focus();
  }

  return (
    <div className={styles.desktop}>
      <a className={styles.skipLink} href="#main-content" onClick={event => {
        event.preventDefault();
        if (home) restoreWelcome();
        else restoreWindow();
        focusContent();
      }}>Skip to content</a>
      <div className={styles.mobileHeading}><span>ANTHONY&apos;S</span><Link href="/">desktop</Link></div>
      <nav className={styles.shortcuts} aria-label="Desktop shortcuts">
        {shortcutOrder.map(href => {
          const item = primaryNavigation.find(item => item.href === href)!;
          return <Link className={styles.shortcut} key={href} href={href} onNavigate={restoreWindow}>
            <span className={styles.shortcutArt}><DesktopIcon kind={sectionIcons[href]}/><span className={styles.shortcutArrow} aria-hidden="true">↗</span></span>
            <span>{href === "/about" ? "About Me" : item.label}</span>
          </Link>;
        })}
      </nav>
      <div className={styles.workspace}>
        <PrimaryWindow
          pathname={pathname}
          title={title}
          icon={icon}
          hidden={minimized || (home && dismissed)}
          maximized={maximized}
          onMinimize={minimizeWindow}
          onMaximize={() => setMaximized(!maximized)}
          onClose={closeWindow}
        >
          {home ? <main id="main-content" tabIndex={-1}>{children}</main> : children}
        </PrimaryWindow>
      </div>
      <div className={styles.desktopSignature} aria-hidden="true"><span>Anthony&apos;s Desktop</span><small>Make yourself at home.</small></div>
      <footer className={styles.taskbar}>
        <StartMenu onWelcome={restoreWelcome} onNavigate={restoreWindow}/>
        <nav className={styles.pinned} aria-label="Pinned shortcuts">
          {["/projects", "/blog", "/travellogs"].filter(href => href !== section?.href).map(href => <Link key={href} href={href} onNavigate={restoreWindow} title={primaryNavigation.find(item => item.href === href)!.label} aria-label={primaryNavigation.find(item => item.href === href)!.label}><DesktopIcon kind={sectionIcons[href]} size={32}/></Link>)}
        </nav>
        {(!home || !dismissed) && <div className={styles.taskGroup} data-preview-dismissed={previewDismissed} onPointerEnter={() => setPreviewDismissed(false)} onFocus={() => setPreviewDismissed(false)}><button
          id="primary-task"
          className={`${styles.taskEntry} ${!minimized ? styles.taskActive : ""}`}
          aria-controls="primary-window"
          aria-expanded={!minimized}
          title={`${minimized ? "Restore" : "Minimize"} ${label}`}
          aria-label={`${minimized ? "Restore" : "Minimize"} ${label}`}
          onClick={() => minimized ? restoreWindow() : minimizeWindow()}
        ><DesktopIcon kind={icon} size={24}/><span>{label}</span></button>
          <div className={styles.taskPreview} aria-hidden="true">
            <div className={styles.previewTitle}><DesktopIcon kind={icon} size={20}/><strong>{title}</strong></div>
            <div className={styles.previewContent}><DesktopIcon kind={icon} size={48}/><span>{summary}<small>{minimized ? "Minimized — click to restore" : "Open — click to minimize"}</small></span></div>
          </div>
        </div>}
        <div className={styles.tray}><SystemClock/></div>
        <button className={styles.showDesktop} title={minimized ? "Restore window" : "Show desktop"} aria-label="Show desktop" aria-pressed={minimized} aria-controls="primary-window" disabled={home && dismissed} onClick={() => {
          if (minimized) restoreWindow();
          else setVisibility({ pathname, minimized: true });
        }}/>
      </footer>
    </div>
  );
}
