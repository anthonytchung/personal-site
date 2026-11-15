"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExplorerLayout } from "@/components/content/explorer-layout";
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

  // Reset only presentation state on a committed route change, including history.
  // The URL still owns content; the shell and window geometry never remount.
  if (visibility.pathname !== pathname) {
    setVisibility({ pathname, minimized: false });
  }
  const minimized = visibility.pathname === pathname && visibility.minimized;
  const section = sections.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const label = home ? "Welcome" : section?.label ?? "Anthony's Desktop";
  const title = home ? "Welcome to Anthony's Desktop" : label;
  const icon = section ? sectionIcons[section.href] ?? "welcome" : "welcome";

  function restoreWindow() { setVisibility({ pathname, minimized: false }); }
  function focusContent() {
    requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true }));
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
          {home ? <main id="main-content" tabIndex={-1}>{children}</main> : <ExplorerLayout>{children}</ExplorerLayout>}
        </PrimaryWindow>
      </div>
      <div className={styles.desktopSignature} aria-hidden="true"><span>Anthony&apos;s Desktop</span><small>Make yourself at home.</small></div>
      <footer className={styles.taskbar}>
        <StartMenu onWelcome={restoreWelcome} onNavigate={restoreWindow}/>
        <nav className={styles.pinned} aria-label="Pinned shortcuts">
          {["/projects", "/blog", "/travellogs"].map(href => <Link key={href} href={href} onNavigate={restoreWindow} title={primaryNavigation.find(item => item.href === href)!.label} aria-label={primaryNavigation.find(item => item.href === href)!.label}><DesktopIcon kind={sectionIcons[href]} size={32}/></Link>)}
        </nav>
        {(!home || !dismissed) && <button
          id="primary-task"
          className={`${styles.taskEntry} ${!minimized ? styles.taskActive : ""}`}
          aria-controls="primary-window"
          aria-expanded={!minimized}
          title={`Restore ${label}`}
          onClick={() => { restoreWindow(); focusContent(); }}
        ><DesktopIcon kind={icon} size={24}/><span>{label}</span></button>}
        <div className={styles.tray}><span className={styles.trayMark} aria-hidden="true">▴</span><SystemClock/></div>
        <Link href="/" onNavigate={restoreWindow} className={styles.showDesktop} title="Go to Desktop" aria-label="Go to Desktop"/>
      </footer>
    </div>
  );
}
