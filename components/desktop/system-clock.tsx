"use client";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./desktop-shell.module.css";
import calendar from "./system-clock.module.css";

export function SystemClock() {
  const faceId = useId();
  const rimId = useId();
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

        </div>
        <div className={calendar.clockFace}>
          <svg viewBox="0 0 140 140" aria-hidden="true">
            <defs>
              <linearGradient id={rimId} x2="0" y2="1"><stop stopColor="#e8edf0"/><stop offset=".48" stopColor="#89969d"/><stop offset="1" stopColor="#e5ecef"/></linearGradient>
              <linearGradient id={faceId} x2=".7" y2="1"><stop stopColor="#f6fafb"/><stop offset=".52" stopColor="#e2ecef"/><stop offset="1" stopColor="#c8d7dd"/></linearGradient>
            </defs>
            <circle cx="70" cy="70" r="66" fill={`url(#${rimId})`} stroke="#8e9da5"/>
            <circle cx="70" cy="70" r="63" fill="#f7fafb" stroke="#fff"/>
            <circle cx="70" cy="70" r="60" fill={`url(#${faceId})`} stroke="#81959f"/>
            <path d="M 16 91 A 60 60 0 0 1 116 31 Z" fill="#fff" opacity=".28"/>
            {Array.from({ length: 60 }, (_, i) => <line key={i} x1="70" y1="14" x2="70" y2={i % 5 === 0 ? "21" : "17"} stroke={i % 5 === 0 ? "#4d6b77" : "#849ca6"} strokeWidth={i % 5 === 0 ? "2" : "1"} transform={`rotate(${i * 6} 70 70)`}/>)}
            <path d="M 68 78 L 68 41 L 70 35 L 72 41 L 72 78 Z" fill="#405c68" transform={`rotate(${now.getHours() * 30 + now.getMinutes() / 2} 70 70)`}/>
            <path d="M 69 81 L 69 22 L 70 18 L 71 22 L 71 81 Z" fill="#405c68" transform={`rotate(${now.getMinutes() * 6 + now.getSeconds() / 10} 70 70)`}/>
            <line x1="70" y1="83" x2="70" y2="17" stroke="#556f7a" strokeWidth=".8" transform={`rotate(${now.getSeconds() * 6} 70 70)`}/>
            <circle cx="70" cy="70" r="3" fill="#466572"/>
          </svg>
          <span>{now.toLocaleTimeString()}</span><span>{now.toLocaleDateString([], { weekday: "long" })}</span>
          <small>{Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll("_", " ")}</small>
        </div>
      </div>
      <div className={calendar.footer}><button className={calendar.today} onClick={() => setMonth(null)}>Today: {now.toLocaleDateString()}</button></div>
    </section>}
  </div>;
}
