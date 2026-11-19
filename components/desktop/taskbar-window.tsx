"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/photos";
import { DesktopIcon, type IconKind } from "./desktop-icon";
import styles from "./desktop-shell.module.css";

type Props = {
  id: "primary" | "utility" | "photo";
  photo?: Photo;
  label: string;
  title: string;
  icon: IconKind;
  active: boolean;
  minimized: boolean;
  onToggle: () => void;
  onActivate: () => void;
  previewActive: boolean;
  onPreview: () => void;
};

// A state-driven miniature, not a screenshot or a second mounted route tree.
function Miniature({ utility, title, heading, photo }: { utility: boolean; title: string; heading: string; photo?: Photo }) {
  return <svg viewBox="0 0 400 260" preserveAspectRatio="none" aria-hidden="true" className={styles.miniature}>
    <rect x="1" y="1" width="398" height="258" rx="3" fill="#b5cfdf" stroke="#55758d"/>
    <text x="9" y="15" fontSize="8" fill="#173448">{title}</text>
    <path d="M350 8h10m8-3h8v7h-8m17-6 7 7m0-7-7 7" fill="none" stroke="#37546c" strokeWidth="1.5"/>
    <rect x="5" y="23" width="390" height="232" fill="white" stroke="#8fa9bb"/>
    {photo ? <g>
      <rect x="5" y="23" width="390" height="232" fill="#eef3fa"/>
      <image href={photo.src} x="6" y="25" width="388" height="201" preserveAspectRatio="xMidYMid meet"/>
      <rect x="5" y="228" width="390" height="27" fill="#d5e4f4"/>
      <circle cx="200" cy="241" r="10" fill="#4386c6" stroke="#8ab7db"/><path d="m197 235 8 6-8 6Z" fill="white"/>
      <path d="m180 237-7 4 7 4m40-8 7 4-7 4" stroke="#6388b1" fill="none"/>
    </g> : utility ? <g fontFamily="Segoe UI,Arial,sans-serif">
      <text x="21" y="45" fontSize="10" fill="#0755a0">System information</text>
      <text x="21" y="65" fontSize="7" fill="#0755a0">Personal edition</text><path d="M85 63h290" stroke="#ccd4dc"/>
      <text x="27" y="86" fontSize="13" fill="#172b3c">Anthony&apos;s Desktop</text><text x="27" y="99" fontSize="8">Personal Edition</text>
      <rect x="322" y="75" width="40" height="27" rx="2" fill="#e5f3fc" stroke="#7297b0"/><rect x="326" y="79" width="32" height="19" fill="#238bc8"/><path d="M338 103v7m-8 0h17" stroke="#7297b0" strokeWidth="3"/>
      <text x="21" y="124" fontSize="7" fill="#0755a0">System</text><path d="M49 122h326" stroke="#ccd4dc"/>
      {[["Computer name:","Anthony's Desktop"],["Owner:","Anthony"],["First inspiration:","The family Windows 7 computer"],["Power source:","Curiosity"],["Nostalgia:","Enabled"]].map(([name,value],i)=><g key={name} fontSize="7" fill="#172b3c"><text x="27" y={139+i*12}>{name}</text><text x="140" y={139+i*12}>{value}</text></g>)}
      <text x="21" y="212" fontSize="7" fill="#0755a0">Where it started</text><path d="M84 210h291" stroke="#ccd4dc"/>
      <text x="27" y="228" fontSize="7">My interest in technology began at home, watching my father</text><text x="27" y="240" fontSize="7">use our family Windows 7 computer.</text>
    </g> : <g fontFamily="Segoe UI,Arial,sans-serif">
      <rect x="5" y="23" width="390" height="20" fill="#e1edf6"/><rect x="10" y="27" width="380" height="12" fill="white" stroke="#9cb3c5"/><text x="18" y="36" fontSize="7">{title}</text>
      <path d="M85 43v202" stroke="#d6e2ed"/>
      {["Projects","About","Journal","Travel Logs","Resume","Experience","Contact"].map((name,i)=><g key={name}><rect x="10" y={51+i*18} width="70" height="16" fill={name===title?"#dceaf8":"#fafcfe"}/><rect x="15" y={56+i*18} width="7" height="6" fill={name==="About"?"#7db9d7":"#ebc664"}/><text x="27" y={62+i*18} fontSize="7" fill="#23384a">{name}</text></g>)}
      <text x="101" y="73" fontSize="14" fill="#203247">{heading}</text>
      {title === "About" ? <>
        <text x="101" y="91" fontSize="7">I build software, explore new ideas, and do things for the fun of it.</text>
        <text x="101" y="117" fontSize="9" fill="#174c78">People &amp; technology</text>
        <text x="101" y="133" fontSize="7">I&apos;ve always really been interested in both people and technology,</text><text x="101" y="145" fontSize="7">and the intersection between them.</text>
        <text x="101" y="174" fontSize="9" fill="#174c78">Away from the keyboard</text><text x="101" y="190" fontSize="7">Going down rabbit holes and learning about new topics.</text>
        <text x="101" y="219" fontSize="9" fill="#174c78">Why Windows 7?</text>
      </> : <><path d="M101 94h255m-255 10h223" stroke="#c4cfd9" strokeWidth="3"/><path d="M101 127h275" stroke="#d6e2ed"/></>}
      <rect x="5" y="245" width="390" height="10" fill="#eef3f8"/>
    </g>}
  </svg>;
}

export function TaskbarWindow({ id, label, title, icon, active, minimized, onToggle, onActivate, previewActive, onPreview, photo }: Props) {
  const task = useRef<HTMLButtonElement>(null);
  const pointerSuppressed = useRef(false);
  const [dismissed, setDismissed] = useState(false);
  const [preview, setPreview] = useState({ left: 6, ratio: 1.5, heading: title === "About" ? "Hi, I’m Anthony." : title });
  const windowId = { primary: "primary-window", utility: "about-computer-window", photo: "photo-viewer-window" }[id];
  const measure = useCallback(() => {
    const button = task.current?.getBoundingClientRect();
    const frame = document.getElementById(windowId);
    if (!button || !frame) return;
    const bounds = frame.getBoundingClientRect();
    const heading = Array.from(frame.querySelectorAll("h1")).find(node => node.getClientRects().length)?.textContent;
    setPreview(previous => ({
      left: Math.max(6, Math.min(button.x + button.width / 2 - 110, innerWidth - 226)),
      ratio: bounds.width && bounds.height ? bounds.width / bounds.height : previous.ratio,
      heading: heading || previous.heading,
    }));
  }, [windowId]);
  useEffect(() => {
    // Measure at disclosure time; no rasterization, polling or duplicate content tree.
    const update = () => measure();
    function dismiss(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const thumbnail = document.getElementById(`${id}-preview`);
      if (thumbnail?.parentElement?.dataset.previewDismissed === "false" && thumbnail.getClientRects().length && getComputedStyle(thumbnail).visibility === "visible") event.preventDefault();
      if (document.activeElement?.id === `${id}-preview`) task.current?.focus();
      pointerSuppressed.current = true;
      setDismissed(true);
    }
    window.addEventListener("resize", update);
    document.addEventListener("keydown", dismiss, true);
    return () => { window.removeEventListener("resize", update); document.removeEventListener("keydown", dismiss, true); };
  }, [measure, id]);
  function reveal() { measure(); onPreview(); setDismissed(false); }
  return <div className={styles.taskGroup} data-application={id} data-preview-dismissed={dismissed || !previewActive} onPointerEnter={() => { if (!pointerSuppressed.current) reveal(); }} onPointerMove={() => {
    // Hiding a hovered thumbnail can synthesize re-entry under a stationary pointer.
    // Reopen only on a fresh pointer movement or an explicit focus action.
    if (pointerSuppressed.current) { pointerSuppressed.current = false; reveal(); }
  }} onFocus={() => { pointerSuppressed.current = false; reveal(); }}>
    <button ref={task} id={`${id}-task`} className={`${styles.taskEntry} ${active ? styles.taskActive : ""}`} aria-label={`${minimized || !active ? "Restore" : "Minimize"} ${label}`} aria-controls={windowId} aria-expanded={!minimized} onClick={() => { onToggle(); pointerSuppressed.current = true; setDismissed(true); }}>
      <DesktopIcon kind={icon} size={32}/><span>{label}</span>
    </button>
    <button id={`${id}-preview`} className={styles.taskPreview} aria-label={`Switch to ${label}`} aria-controls={windowId} style={{ left: preview.left }} onClick={() => { onActivate(); pointerSuppressed.current = true; setDismissed(true); }}>
      <span className={styles.previewTitle}><DesktopIcon kind={icon} size={16}/><span>{title}</span></span>
      <span className={styles.previewContent} style={{ aspectRatio: Math.max(1.25, Math.min(2.3, preview.ratio)) }}><Miniature photo={photo} utility={id === "utility"} title={title} heading={preview.heading}/></span>
    </button>
  </div>;
}
