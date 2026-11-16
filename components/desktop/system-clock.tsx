"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./desktop-shell.module.css";
import calendar from "./system-clock.module.css";

export function SystemClock() {
  const [now, setNow] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    const initial = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 1000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, []);
  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  const displayed = month ?? now;
  const days = displayed ? new Date(displayed.getFullYear(), displayed.getMonth() + 1, 0).getDate() : 0;
  const offset = displayed ? new Date(displayed.getFullYear(), displayed.getMonth(), 1).getDay() : 0;
  function changeMonth(delta: number) {
    if (displayed) setMonth(new Date(displayed.getFullYear(), displayed.getMonth() + delta, 1));
  }
  return <div ref={root} className={calendar.root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }}>
    <button ref={trigger} className={calendar.trigger} aria-label="Date and time" aria-expanded={open} aria-controls="clock-calendar" onClick={() => {
      if (!open) setMonth(null);
      setOpen(!open);
    }}>
      <time className={styles.clock} dateTime={now?.toISOString()} title={now?.toLocaleString()}>
        <span>{now ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—:—"}</span>
        <span>{now ? now.toLocaleDateString([], { month: "numeric", day: "numeric", year: "numeric" }) : ""}</span>
      </time>
    </button>
    {open && now && displayed && <section id="clock-calendar" className={calendar.flyout} role="dialog" aria-label="Date and time calendar">
      <div className={calendar.heading}><strong>{now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong><button ref={close} aria-label="Close calendar" onClick={() => { setOpen(false); trigger.current?.focus(); }}>×</button></div>
      <div className={calendar.contents}>
        <div>
          <div className={calendar.month}><button aria-label="Previous month" onClick={() => changeMonth(-1)}>‹</button><strong aria-live="polite">{displayed.toLocaleDateString([], { month: "long", year: "numeric" })}</strong><button aria-label="Next month" onClick={() => changeMonth(1)}>›</button></div>
          <table className={calendar.grid} aria-label={displayed.toLocaleDateString([], { month: "long", year: "numeric" })}>
            <thead><tr>{Array.from({ length: 7 }, (_, i) => <th key={i} scope="col"><abbr title={new Date(2026, 10, 1 + i).toLocaleDateString([], { weekday: "long" })}>{new Date(2026, 10, 1 + i).toLocaleDateString([], { weekday: "short" })}</abbr></th>)}</tr></thead>
            <tbody>{Array.from({ length: Math.ceil((offset + days) / 7) }, (_, row) => <tr key={row}>{Array.from({ length: 7 }, (_, col) => {
              const day = row * 7 + col - offset + 1;
              const today = day === now.getDate() && displayed.getMonth() === now.getMonth() && displayed.getFullYear() === now.getFullYear();
              return <td key={col} aria-current={today ? "date" : undefined}>{day > 0 && day <= days ? day : ""}</td>;
            })}</tr>)}</tbody>
          </table>
          <button className={calendar.today} onClick={() => setMonth(null)}>Today: {now.toLocaleDateString()}</button>
        </div>
        <div className={calendar.clockFace}>
          <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="55" fill="#fbfdff" stroke="#65849a" strokeWidth="3"/>{Array.from({ length: 12 }, (_, i) => <line key={i} x1="60" y1="10" x2="60" y2="16" stroke="#45647b" transform={`rotate(${i * 30} 60 60)`}/>)}<line x1="60" y1="60" x2="60" y2="32" stroke="#203247" strokeWidth="4" transform={`rotate(${now.getHours() * 30 + now.getMinutes() / 2} 60 60)`}/><line x1="60" y1="60" x2="60" y2="19" stroke="#203247" strokeWidth="2" transform={`rotate(${now.getMinutes() * 6} 60 60)`}/><circle cx="60" cy="60" r="3" fill="#203247"/></svg>
          <span>{now.toLocaleTimeString()}</span><small>{Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll("_", " ")}</small>
        </div>
      </div>
    </section>}
  </div>;
}
