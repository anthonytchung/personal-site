"use client";
import { createContext } from "react";
import type { Photo } from "@/lib/photos";

export const PhotoActions = createContext<((photos: readonly Photo[], index: number, opener: HTMLElement) => void) | null>(null);
