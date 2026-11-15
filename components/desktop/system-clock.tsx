"use client";
import { useEffect, useState } from "react";
import styles from "./desktop-shell.module.css";

export function SystemClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    const initial = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 1000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, []);
  return <time className={styles.clock} dateTime={now?.toISOString()} title={now?.toLocaleString()}>
    <span>{now ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—:—"}</span>
    <span>{now ? now.toLocaleDateString([], { month: "numeric", day: "numeric", year: "numeric" }) : ""}</span>
  </time>;
}
