"use client";

import { useSyncExternalStore } from "react";
const key = "anthony-desktop:welcome-dismissed";
const event = "anthony-desktop:welcome-change";
let fallback = false;
function snapshot() {
  try { return sessionStorage.getItem(key) === "true"; } catch { return fallback; }
}
function subscribe(notify: () => void) {
  window.addEventListener(event, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(event, notify);
    window.removeEventListener("storage", notify);
  };
}
export function setWelcomeDismissed(value: boolean) {
  fallback = value;
  try { sessionStorage.setItem(key, String(value)); } catch { /* In-memory fallback when storage is unavailable. */ }
  window.dispatchEvent(new Event(event));
}
export function useWelcomeDismissed() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
