"use client";
import { createContext, useContext } from "react";

export const UtilityActions = createContext<(() => void) | null>(null);

export function AboutComputerButton({ children = "About This Computer" }: { children?: React.ReactNode }) {
  const open = useContext(UtilityActions);
  return <button type="button" onClick={open ?? undefined} aria-controls="about-computer-window" style={{ cursor: "pointer" }}>{children}</button>;
}
