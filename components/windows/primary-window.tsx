"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { DesktopIcon, type IconKind } from "@/components/desktop/desktop-icon";
import { useMediaQuery } from "./use-media-query";
import { useWindowPosition } from "./use-window-position";
import styles from "./primary-window.module.css";

type Props = {
  children: ReactNode;
  id?: string;
  utility?: boolean;
  photo?: boolean;
  inert?: boolean;
  layer?: number;
  accessibleTitle?: string;
  active?: boolean;
  onFocusWindow?: () => void;
  pathname: string;
  title: string;
  icon: IconKind;
  hidden: boolean;
  maximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
};

export function PrimaryWindow({ children, pathname, title, icon, hidden, maximized, onMinimize, onMaximize, onClose, id = "primary-window", utility = false, active = true, onFocusWindow, photo = false, inert = false, layer, accessibleTitle }: Props) {
  const mobile = useMediaQuery("(max-width: 700px)");
  const { frameRef, style, positioned, center, handleProps, resizeProps } = useWindowPosition(maximized || hidden);
  const bodyRef = useRef<HTMLDivElement>(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    const frame = requestAnimationFrame(() => {
      // Next controls the URL; this scroll container owns desktop reading position.
      if (window.location.hash) return;
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
      // React Activity can retain hidden route trees; only reset/focus the active pane.
      const main = Array.from(bodyRef.current?.querySelectorAll<HTMLElement>("main") ?? [])
        .find(element => element.getClientRects().length > 0);
      if (main) main.scrollTop = 0;
      main?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return <div
    ref={frameRef}
    className={`win7 ${styles.position}`}
    data-utility={utility}
    data-photo={photo}
    inert={inert}
    onPointerDownCapture={onFocusWindow}
    onFocusCapture={onFocusWindow}
    data-active={active}
    data-home={pathname === "/"}
    data-hidden={hidden}
    data-maximized={maximized}
    data-positioned={positioned}
    style={{ ...style, zIndex: photo && mobile ? 50 : layer }}
  >
    <section id={id} data-app-window className={`window glass ${active ? "active" : ""} ${styles.window}`} aria-label={accessibleTitle ?? title} aria-modal={photo && mobile ? true : undefined} role={utility ? "dialog" : undefined} tabIndex={utility ? -1 : undefined} onKeyDown={event => {
      if (photo && mobile && event.key === "Tab") {
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], [tabindex='0']")).filter(element => element.getClientRects().length > 0);
        const first = controls[0]; const last = controls.at(-1);
        if (event.shiftKey && (document.activeElement === first || (document.activeElement === event.currentTarget || document.activeElement?.hasAttribute("data-photo-content")))) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || (document.activeElement === event.currentTarget || document.activeElement?.hasAttribute("data-photo-content")))) { event.preventDefault(); first?.focus(); }
      }
      if (utility && event.key === "Escape" && !event.defaultPrevented) { event.stopPropagation(); onClose(); } }}>
      <div className={`title-bar ${styles.titleBar}`}>
        <button className={styles.centerButton} aria-label="Center window" title="Center window" disabled={maximized} onClick={center}>
          <DesktopIcon kind={icon} size={18}/>
        </button>
        <div
          {...handleProps}
          className={`title-bar-text ${styles.dragHandle}`}
          tabIndex={0}
          role="group"
          aria-label={`${title} window title bar`}
          aria-describedby={`${id}-move-help`}
          onDoubleClick={onMaximize}
          title="Drag to move. Double-click to maximize or restore. Arrow keys move; Home centers."
        >{title}</div>
        <span id={`${id}-move-help`} className={styles.srOnly}>Use arrow keys to move the window, Shift for smaller steps, or Home to center it. Escape cancels a drag. Restore a maximized window before moving it.</span>
        <div className="title-bar-controls">
          <button aria-label="Minimize" title={`Minimize ${title}`} onClick={onMinimize}/>
          <button aria-label={maximized ? "Restore" : "Maximize"} title={maximized ? "Restore window size" : "Maximize window"} onClick={onMaximize}/>
          <button aria-label="Close" title={`Close ${title}`} onClick={onClose}/>
        </div>
      </div>
      <div ref={bodyRef} className={`window-body ${styles.body}`}>{children}</div>
      <button
        {...resizeProps}
        className={styles.resizeHandle}
        aria-label="Resize window"
        aria-describedby={`${id}-resize-help`}
        aria-controls={id}
        title="Resize window. Arrow keys resize; Shift uses smaller steps."
        disabled={maximized}
      ><span aria-hidden="true">◢</span></button>
      <span id={`${id}-resize-help`} className={styles.srOnly}>Drag to resize, or focus this handle and use Left and Right to change width and Up and Down to change height. Shift uses one-pixel steps. Escape cancels a drag. You can also use the Maximize button to enlarge the window.</span>
    </section>
  </div>;
}
