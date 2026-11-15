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
      <button
        {...resizeProps}
        className={styles.resizeHandle}
        aria-label="Resize window"
        aria-describedby="window-resize-help"
        aria-controls="primary-window"
        title="Resize window. Arrow keys resize; Shift uses smaller steps."
        disabled={maximized}
      ><span aria-hidden="true">◢</span></button>
      <span id="window-resize-help" className={styles.srOnly}>Drag to resize, or focus this handle and use Left and Right to change width and Up and Down to change height. Shift uses one-pixel steps. Escape cancels a drag. You can also use the Maximize button to enlarge the window.</span>
    </section>
  </div>;
}
