"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExplorerLayout } from "@/components/content/explorer-layout";
import { primaryNavigation } from "@/lib/navigation";
import { DesktopIcon } from "./desktop-icon";
import { StartMenu, sectionIcons } from "./start-menu";
import { SystemClock } from "./system-clock";
import { setWelcomeDismissed, useWelcomeDismissed } from "./welcome-session";
import styles from "./desktop-shell.module.css";

const shortcutOrder = ["/projects", "/blog", "/travellogs", "/about", "/resume"];

export function DesktopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const home = pathname === "/";
  const dismissed = useWelcomeDismissed();
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  function restoreWelcome() {
    setWelcomeDismissed(false);
    setMinimized(false);
  }
  function focusStart() { document.getElementById("start-button")?.focus(); }
  const title = home ? "Welcome to Anthony's Desktop" : "Anthony's Desktop";
  return (
    <div className={styles.desktop}>
      <a className={styles.skipLink} href="#main-content" onClick={event => {
        event.preventDefault();
        if (home) restoreWelcome();
        requestAnimationFrame(() => document.getElementById("main-content")?.focus());
      }}>Skip to content</a>
      <div className={styles.mobileHeading}><span>ANTHONY&apos;S</span><Link href="/">desktop</Link></div>
      <nav className={styles.shortcuts} aria-label="Desktop shortcuts">
        {shortcutOrder.map(href => {
          const item = primaryNavigation.find(item => item.href === href)!;
          return <Link className={styles.shortcut} key={href} href={href}>
            <span className={styles.shortcutArt}><DesktopIcon kind={sectionIcons[href]}/><span className={styles.shortcutArrow} aria-hidden="true">↗</span></span>
            <span>{href === "/about" ? "About Me" : item.label}</span>
          </Link>;
        })}
      </nav>
      <div className={`${styles.workspace} ${home ? styles.homeWorkspace : ""}`}>
        <div className={`win7 ${styles.windowPosition} ${home && maximized ? styles.maximized : ""} ${home && (dismissed || minimized) ? styles.dismissed : ""}`}>
          <section className={`window glass active ${styles.applicationWindow}`} aria-label={title}>
            <div className={`title-bar ${styles.titleBar}`}>
              <div className={`title-bar-text ${styles.titleText}`}><DesktopIcon kind="welcome" size={18}/><span>{title}</span></div>
              {home && <div className="title-bar-controls">
                <button aria-label="Minimize" title="Minimize Welcome" onClick={() => { setMinimized(true); document.getElementById("welcome-task")?.focus(); }}/>
                <button aria-label={maximized ? "Restore" : "Maximize"} title={maximized ? "Restore window size" : "Maximize Welcome"} onClick={() => setMaximized(!maximized)}/>
                <button aria-label="Close" title="Close Welcome" onClick={() => { setWelcomeDismissed(true); focusStart(); }}/>
              </div>}
            </div>
            <div className={`window-body ${styles.windowBody}`}>
              {home ? <main id="main-content" tabIndex={-1}>{children}</main> : <ExplorerLayout>{children}</ExplorerLayout>}
            </div>
          </section>
        </div>
      </div>
      <div className={styles.desktopSignature} aria-hidden="true"><span>Anthony&apos;s Desktop</span><small>Make yourself at home.</small></div>
      <footer className={styles.taskbar}>
        <StartMenu onWelcome={restoreWelcome}/>
        <nav className={styles.pinned} aria-label="Pinned shortcuts">
          {["/projects", "/blog", "/travellogs"].map(href => <Link key={href} href={href} title={primaryNavigation.find(item => item.href === href)!.label} aria-label={primaryNavigation.find(item => item.href === href)!.label}><DesktopIcon kind={sectionIcons[href]} size={32}/></Link>)}
        </nav>
        {home && !dismissed && <button id="welcome-task" className={`${styles.taskEntry} ${!minimized ? styles.taskActive : ""}`} onClick={() => {
          setMinimized(false);
          requestAnimationFrame(() => document.getElementById("main-content")?.focus());
        }}><DesktopIcon kind="welcome" size={24}/><span>Welcome</span></button>}
        {!home && <Link className={styles.taskEntry} href="/">Desktop</Link>}
        <div className={styles.tray}><span className={styles.trayMark} aria-hidden="true">▴</span><SystemClock/></div>
        <Link href="/" className={styles.showDesktop} title="Go to Desktop" aria-label="Go to Desktop"/>
      </footer>
    </div>
  );
}
