"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { photoTitle, type Photo } from "@/lib/photos";
import { useMediaQuery } from "@/components/windows/use-media-query";
import styles from "./photo-viewer.module.css";

type Props = { photos: readonly Photo[]; index: number; suspended: boolean; onIndex: (index: number) => void; onClose: () => void };

function ControlIcon({ kind }: { kind: "fit" | "actual" | "previous" | "next" | "play" | "pause" }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
    {kind === "fit" ? <><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M7 10V8h3m7 6v2h-3m-7-2v2h3m7-6V8h-3"/></> : kind === "actual" ? <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M10 7v6M7 10h6"/></> : kind === "previous" ? <path d="M7 6v12m11-12-9 6 9 6Z" fill="currentColor"/> : kind === "next" ? <path d="M17 6v12M6 6l9 6-9 6Z" fill="currentColor"/> : kind === "play" ? <path d="m9 5 10 7-10 7Z" fill="currentColor" stroke="white"/> : <path d="M8 5v14m8-14v14" strokeWidth="4"/>}
  </svg>;
}

export function PhotoViewer({ photos, index, suspended, onIndex, onClose }: Props) {
  const photo = photos[index];
  const viewport = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<"fit" | "actual">("fit");
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const mobile = useMediaQuery("(max-width: 700px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  function advance(direction: number) {
    setSize("fit");
    onIndex((index + direction + photos.length) % photos.length);
  }
  useEffect(() => {
    if (!playing || suspended || reducedMotion || photos.length < 2) return;
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") advance(1); }, 5000);
    return () => clearInterval(timer);
  });
  useEffect(() => {
    if (!mobile || suspended) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [mobile, suspended]);
  const metadata = [`${photo.width} × ${photo.height}`, photo.location, photo.takenAt, photo.camera].filter(Boolean).join(" · ");
  return <div className={styles.viewer} data-photo-content tabIndex={-1} onKeyDown={event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); event.stopPropagation(); advance(event.key === "ArrowLeft" ? -1 : 1); }
    if (event.key === "Escape" && playing) { event.preventDefault(); event.stopPropagation(); setPlaying(false); }
  }}>
    <div className={styles.mobileHeader}><strong>{photoTitle(photo)}</strong><button type="button" onClick={onClose}>Close</button></div>
    <div className={styles.commandBar}><a href={photo.src} target="_blank" rel="noopener noreferrer">Open original <span aria-hidden="true">↗</span></a><span>{index + 1} of {photos.length}</span></div>
    <div ref={viewport} className={styles.viewport} data-size={size} aria-label="Photograph" role="group" tabIndex={0}>
      {failed === photo.src ? <p className={styles.error} role="status">This photograph couldn’t be loaded. You can try opening the original.</p> : <div className={styles.canvas}>
        <Image key={photo.src} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} unoptimized onError={() => { setPlaying(false); setFailed(photo.src); }}/>
      </div>}
    </div>
    <div className={styles.caption}>
      <p role="status" aria-live="polite">{photo.caption || photoTitle(photo)}</p>
      <p className={styles.metadata}>{metadata}</p>
    </div>
    <div className={styles.controlBar}>
      <div className={styles.controls} role="group" aria-label="Photo controls">
        <button type="button" aria-label="Zoom to fit" title="Zoom to fit" aria-pressed={size === "fit"} onClick={() => setSize("fit")}><ControlIcon kind="fit"/></button>
        <button type="button" aria-label="Actual size" title="Actual size" aria-pressed={size === "actual"} onClick={() => {
          setSize("actual");
          requestAnimationFrame(() => { const frame = viewport.current; if (frame) frame.scrollTo((frame.scrollWidth - frame.clientWidth) / 2, (frame.scrollHeight - frame.clientHeight) / 2); });
        }}><ControlIcon kind="actual"/></button>
        <span className={styles.separator}/>
        <button type="button" aria-label="Previous photograph" title="Previous photograph" disabled={photos.length < 2} onClick={() => advance(-1)}><ControlIcon kind="previous"/></button>
        <button type="button" className={styles.play} aria-label={playing ? "Pause slideshow" : "Start slideshow"} title={reducedMotion ? "Slideshow is disabled with reduced motion" : playing ? "Pause slideshow" : "Start slideshow"} aria-pressed={playing} disabled={photos.length < 2 || reducedMotion} onClick={() => { setSize("fit"); setPlaying(!playing); }}><ControlIcon kind={playing ? "pause" : "play"}/></button>
        <button type="button" aria-label="Next photograph" title="Next photograph" disabled={photos.length < 2} onClick={() => advance(1)}><ControlIcon kind="next"/></button>
      </div>
    </div>
  </div>;
}
