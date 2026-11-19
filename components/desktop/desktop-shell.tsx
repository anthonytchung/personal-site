"use client";

import type { SearchEntry } from "@/lib/site-search";
import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PhotoViewer } from "@/components/apps/photo-viewer";
import { PhotoActions } from "@/components/apps/photo-actions";
import { photoTitle, validatePhotos, type Photo } from "@/lib/photos";
import { useMediaQuery } from "@/components/windows/use-media-query";
import { AboutComputer } from "@/components/apps/about-computer";
import { UtilityActions } from "@/components/apps/utility-actions";
import { PrimaryWindow } from "@/components/windows/primary-window";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import { DesktopIcon } from "./desktop-icon";
import { StartMenu, sectionIcons } from "./start-menu";
import { TaskbarWindow } from "./taskbar-window";
import { SystemClock } from "./system-clock";
import { setWelcomeDismissed, useWelcomeDismissed } from "./welcome-session";
import styles from "./desktop-shell.module.css";

type WindowId = "primary" | "utility" | "photo";

const shortcutOrder = ["/projects", "/blog", "/travellogs", "/about", "/resume"];
const sections = [...primaryNavigation, ...secondaryNavigation];

export function DesktopShell({ children, searchEntries }: { children: ReactNode; searchEntries: SearchEntry[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const home = pathname === "/";
  const dismissed = useWelcomeDismissed();
  const [visibility, setVisibility] = useState({ pathname, minimized: false });
  const [utility, setUtility] = useState({ open: false, minimized: false, maximized: false });
  const [photo, setPhoto] = useState({ photos: [] as readonly Photo[], index: 0, minimized: false, maximized: false, session: 0 });
  const photoOpen = photo.photos.length > 0;
  const mobile = useMediaQuery("(max-width: 700px)");
  const photoModal = mobile && photoOpen && !photo.minimized;
  const [focused, setFocused] = useState<WindowId>("primary");
  const [order, setOrder] = useState<WindowId[]>(["primary", "utility", "photo"]);
  const photoOpener = useRef<HTMLElement | null>(null);
  function activate(id: WindowId) {
    setFocused(id);
    setOrder(previous => previous.at(-1) === id ? previous : [...previous.filter(item => item !== id), id]);
  }
  function layer(id: WindowId) { return focused === id ? 4 : 2 + order.filter(item => item !== focused).indexOf(id); }
  function nextVisible(exclude: WindowId) {
    return [...order].reverse().find(id => id !== exclude && (id === "primary" ? !visibility.minimized && !(home && dismissed) : id === "utility" ? utility.open && !utility.minimized : photoOpen && !photo.minimized)) ?? "primary";
  }
  function focusPhoto() { requestAnimationFrame(() => document.querySelector<HTMLElement>("#photo-viewer-window [data-photo-content]")?.focus({ preventScroll: true })); }
  function openPhotos(photos: readonly Photo[], index: number, opener: HTMLElement) {
    validatePhotos(photos);
    photoOpener.current = opener;
    setPhoto(previous => ({ photos, index: Math.max(0, Math.min(index, photos.length - 1)), minimized: false, maximized: previous.maximized, session: previous.session + 1 }));
    setDesktopSnapshot(null);
    activate("photo");
    focusPhoto();
  }
  function closePhoto() {
    const next = nextVisible("photo");
    setPhoto(previous => ({ ...previous, photos: [], minimized: false, maximized: false }));
    activate(next);
    requestAnimationFrame(() => {
      if (photoOpener.current?.isConnected && photoOpener.current.getClientRects().length && !photoOpener.current.closest("[inert]")) photoOpener.current.focus({ preventScroll: true });
      else if (next === "utility") focusUtility();
      else if (next === "primary" && !visibility.minimized && !(home && dismissed)) focusContent();
      else document.getElementById("start-button")?.focus();
    });
  }
  const [previewOwner, setPreviewOwner] = useState<WindowId | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [desktopSnapshot, setDesktopSnapshot] = useState<{ primary: boolean; utility: boolean; photo: boolean; focused: WindowId } | null>(null);
  function focusUtility() {
    requestAnimationFrame(() => {
      const window = document.getElementById("about-computer-window");
      window?.focus({ preventScroll: true });
      if (matchMedia("(max-width: 700px)").matches) window?.scrollIntoView({ block: "start" });
    });
  }
  function openUtility() {
    opener.current = document.activeElement as HTMLElement;
    setDesktopSnapshot(null);
    setUtility(previous => ({ ...previous, open: true, minimized: false }));
    activate("utility");
    focusUtility();
  }
  function closeUtility() {
    setUtility({ open: false, minimized: false, maximized: false });
    activate(nextVisible("utility"));
    requestAnimationFrame(() => {
      if (opener.current?.isConnected && opener.current.getClientRects().length) opener.current.focus({ preventScroll: !matchMedia("(max-width: 700px)").matches });
      else document.getElementById("start-button")?.focus();
    });
  }
  function toggleDesktop() {
    if (desktopSnapshot) {
      setVisibility({ pathname, minimized: desktopSnapshot.primary });
      setUtility(previous => ({ ...previous, minimized: desktopSnapshot.utility }));
      setPhoto(previous => ({ ...previous, minimized: desktopSnapshot.photo }));
      if (desktopSnapshot.focused === "photo" && !desktopSnapshot.photo && photoOpen) focusPhoto();
      else if (desktopSnapshot.focused === "utility" && !desktopSnapshot.utility && utility.open) focusUtility();
      else if (!desktopSnapshot.primary) focusContent();
      setDesktopSnapshot(null);
    } else if (minimized && (!utility.open || utility.minimized) && (!photoOpen || photo.minimized)) {
      restoreWindow();
    } else {
      setDesktopSnapshot({ primary: minimized, utility: utility.minimized, photo: photo.minimized, focused });
      setVisibility({ pathname, minimized: true });
      setUtility(previous => ({ ...previous, minimized: true }));
      setPhoto(previous => ({ ...previous, minimized: true }));
    }
  }
  const [maximized, setMaximized] = useState(false);
  // Reset only presentation state on a committed route change, including history.
  // The URL still owns content; the shell and window geometry never remount.
  if (visibility.pathname !== pathname) {
    setVisibility({ pathname, minimized: false });
    activate("primary");
    setDesktopSnapshot(null);
    if (mobile) { setUtility(previous => ({ ...previous, minimized: true })); setPhoto(previous => ({ ...previous, minimized: true })); }
  }
  const minimized = visibility.pathname === pathname && visibility.minimized;
  const section = sections.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const label = home ? "Welcome" : pathname === "/travellogs/gilman" ? "Gilman" : section?.label ?? "Anthony's Desktop";
  const title = home ? "Welcome to Anthony's Desktop" : label;
  const icon = section ? sectionIcons[section.href] ?? "welcome" : "welcome";

  function restoreWindow() {
    if (mobile) { setUtility(previous => ({ ...previous, minimized: true })); setPhoto(previous => ({ ...previous, minimized: true })); }
    setDesktopSnapshot(null);
    activate("primary");
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
    activate(nextVisible("primary"));
    document.getElementById("primary-task")?.focus();
  }
  function closeWindow() {
    if (home) setWelcomeDismissed(true);
    else router.push("/");
    document.getElementById("start-button")?.focus();
  }

  return (
    <UtilityActions value={openUtility}><PhotoActions value={openPhotos}><div className={styles.desktop} data-mobile-utility={utility.open && !utility.minimized}>
      <a inert={photoModal} className={styles.skipLink} href="#main-content" onClick={event => {
        event.preventDefault();
        if (home) restoreWelcome();
        else restoreWindow();
        focusContent();
      }}>Skip to content</a>
      <div inert={photoModal} className={styles.mobileHeading}><span>ANTHONY&apos;S</span><Link href="/">desktop</Link></div>
      <nav inert={photoModal} className={styles.shortcuts} aria-label="Desktop shortcuts">
        {shortcutOrder.map(href => {
          const item = primaryNavigation.find(item => item.href === href)!;
          return <Link className={styles.shortcut} key={href} href={href} onNavigate={restoreWindow}>
            <span className={styles.shortcutArt}><DesktopIcon kind={sectionIcons[href]}/><span className={styles.shortcutArrow} aria-hidden="true"><svg viewBox="0 0 16 16" width="14" height="14"><path d="M2 13V9c0-3 2-5 6-5V1l6 5-6 5V8c-3 0-4 1-6 5Z" fill="#3b6c9d" stroke="white" strokeWidth=".7"/></svg></span></span>
            <span>{href === "/about" ? "About Me" : item.label}</span>
          </Link>;
        })}
      </nav>
      <div className={styles.workspace}>
        <PrimaryWindow
          layer={layer("primary")} inert={photoModal}
          active={focused === "primary"}
          onFocusWindow={() => activate("primary")}
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
        {utility.open && <PrimaryWindow layer={layer("utility")} inert={photoModal} id="about-computer-window" utility active={focused === "utility"} onFocusWindow={() => activate("utility")} pathname="utility" title="About This Computer" icon="welcome" hidden={utility.minimized} maximized={utility.maximized}
          onMinimize={() => { setUtility(previous => ({ ...previous, minimized: true })); activate(nextVisible("utility")); document.getElementById("utility-task")?.focus(); }}
          onMaximize={() => setUtility(previous => ({ ...previous, maximized: !previous.maximized }))} onClose={closeUtility}>
          <AboutComputer onClose={closeUtility}/>
        </PrimaryWindow>}
        {photoOpen && <PrimaryWindow layer={layer("photo")} photo utility id="photo-viewer-window" accessibleTitle="Photo Viewer" title={`${photoTitle(photo.photos[photo.index])} - Photo Viewer`} icon="photo" pathname="photo-utility" active={focused === "photo"} onFocusWindow={() => activate("photo")} hidden={photo.minimized} maximized={photo.maximized}
          onMinimize={() => { setPhoto(previous => ({ ...previous, minimized: true })); activate(nextVisible("photo")); document.getElementById("photo-task")?.focus(); }}
          onMaximize={() => setPhoto(previous => ({ ...previous, maximized: !previous.maximized }))} onClose={closePhoto}>
          <PhotoViewer key={photo.session} photos={photo.photos} index={photo.index} suspended={photo.minimized || focused !== "photo"} onIndex={index => setPhoto(previous => ({ ...previous, index }))} onClose={closePhoto}/>
        </PrimaryWindow>}
      </div>
      <div className={styles.desktopSignature} aria-hidden="true"><span>Anthony&apos;s Desktop</span><small>Make yourself at home.</small></div>
      <footer inert={photoModal} className={styles.taskbar}>
        <StartMenu searchEntries={searchEntries} onWelcome={restoreWelcome} onNavigate={restoreWindow}/>
        <nav className={styles.pinned} aria-label="Pinned shortcuts">
          {["/projects", "/blog", "/travellogs"].filter(href => href !== section?.href).map(href => <Link key={href} href={href} onNavigate={restoreWindow} title={primaryNavigation.find(item => item.href === href)!.label} aria-label={primaryNavigation.find(item => item.href === href)!.label}><DesktopIcon kind={sectionIcons[href]} size={32}/></Link>)}
        </nav>
        {(!home || !dismissed) && <TaskbarWindow previewActive={previewOwner === "primary"} onPreview={() => setPreviewOwner("primary")} id="primary" label={label} title={title} icon={icon} active={!minimized && focused === "primary"} minimized={minimized}
          onToggle={() => minimized || focused !== "primary" ? restoreWindow() : minimizeWindow()} onActivate={restoreWindow}/>}
        {utility.open && <TaskbarWindow previewActive={previewOwner === "utility"} onPreview={() => setPreviewOwner("utility")} id="utility" label="About This Computer" title="About This Computer" icon="welcome" active={!utility.minimized && focused === "utility"} minimized={utility.minimized}
          onToggle={() => {
            setDesktopSnapshot(null);
            if (!utility.minimized && focused === "utility") { setUtility(previous => ({ ...previous, minimized: true })); activate(nextVisible("utility")); }
            else { setUtility(previous => ({ ...previous, minimized: false })); activate("utility"); focusUtility(); }
          }} onActivate={() => { setDesktopSnapshot(null); setUtility(previous => ({ ...previous, minimized: false })); activate("utility"); focusUtility(); }}/>}
        {photoOpen && <TaskbarWindow previewActive={previewOwner === "photo"} onPreview={() => setPreviewOwner("photo")} id="photo" label="Photo Viewer" title={`${photoTitle(photo.photos[photo.index])} - Photo Viewer`} icon="photo" photo={photo.photos[photo.index]} active={!photo.minimized && focused === "photo"} minimized={photo.minimized}
          onToggle={() => {
            setDesktopSnapshot(null);
            if (!photo.minimized && focused === "photo") { setPhoto(previous => ({ ...previous, minimized: true })); activate(nextVisible("photo")); }
            else { setPhoto(previous => ({ ...previous, minimized: false })); activate("photo"); focusPhoto(); }
          }} onActivate={() => { setDesktopSnapshot(null); setPhoto(previous => ({ ...previous, minimized: false })); activate("photo"); focusPhoto(); }}/>}
        <div className={styles.tray}><SystemClock/></div>
        <button className={styles.showDesktop} title={minimized ? "Restore window" : "Show desktop"} aria-label="Show desktop" aria-pressed={desktopSnapshot !== null || minimized} aria-controls={["primary-window", utility.open && "about-computer-window", photoOpen && "photo-viewer-window"].filter(Boolean).join(" ")} disabled={home && dismissed && !utility.open && !photoOpen} onClick={toggleDesktop}/>
      </footer>
    </div></PhotoActions></UtilityActions>
  );
}
