"use client";
import { useState } from "react";
import styles from "./contact.module.css";

export function CopyEmail({ email }: { email: string }) {
  const [result, setResult] = useState<"idle" | "copying" | "copied" | "error">("idle");
  async function copy() {
    setResult("copying");
    try {
      await navigator.clipboard.writeText(email);
      setResult("copied");
    } catch {
      setResult("error");
    }
  }
  return <div className={styles.copy}>
    <button type="button" disabled={result === "copying"} onClick={copy}>Copy email</button>
    <p role="status">{result === "copied" ? "Email address copied." : result === "error" ? "Couldn’t copy. Select the email address to copy it manually." : ""}</p>
  </div>;
}
