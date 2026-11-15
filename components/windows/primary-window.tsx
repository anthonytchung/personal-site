"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { DesktopIcon, type IconKind } from "@/components/desktop/desktop-icon";
import { useWindowPosition } from "./use-window-position";
import styles from "./primary-window.module.css";

type Props = {
  children: ReactNode;
  pathname: string;
  title: string;
  icon: IconKind;
  hidden: boolean;
  maximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
};

export function PrimaryWindow({ children, pathname, title, icon, hidden, maximized, onMinimize, onMaximize, onClose }: Props) {
  const { frameRef, style, positioned, center, handleProps } = useWindowPosition(maximized || hidden);
  const bodyRef = useRef<HTMLDivElement>(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    const frame = requestAnimationFrame(() => {
      // Next controls the URL; this scroll container owns desktop reading position.
      if (window.location.hash) return;
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
      bodyRef.current?.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return <div
    ref={frameRef}
    className={`win7 ${styles.position}`}
    data-home={pathname === "/"}
    data-hidden={hidden}
    data-maximized={maximized}
    data-positioned={positioned}
    style={style}
  >
    <section id="primary-window" className={`window glass active ${styles.window}`} aria-label={title}>
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
          aria-describedby="window-move-help"
          title="Drag to move. Arrow keys move; Home centers."
        >{title}</div>
        <span id="window-move-help" className={styles.srOnly}>Use arrow keys to move the window, Shift for smaller steps, or Home to center it. Escape cancels a drag. Restore a maximized window before moving it.</span>
        <div className="title-bar-controls">
          <button aria-label="Minimize" title={`Minimize ${title}`} onClick={onMinimize}/>
          <button aria-label={maximized ? "Restore" : "Maximize"} title={maximized ? "Restore window size" : "Maximize window"} onClick={onMaximize}/>
          <button aria-label="Close" title={`Close ${title}`} onClick={onClose}/>
        </div>
      </div>
      <div ref={bodyRef} className={`window-body ${styles.body}`}>{children}</div>
    </section>
  </div>;
}
