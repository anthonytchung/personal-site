"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

type Point = { x: number; y: number };
type Size = { width: number; height: number };
type Geometry = { position: Point | null; size: Size | null };
type Gesture = {
  mode: "move" | "resize";
  pointerId: number;
  origin: Point;
  size: Size;
  previous: Geometry;
  pointer: Point;
  handle: HTMLElement;
};

const margin = 8;
const desktopQuery = "(min-width: 701px)";

// Position and restored size belong to the persistent outer frame, not the 7.css skin.
export function useWindowPosition(disabled: boolean) {
  const frameRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const [geometry, setGeometry] = useState<Geometry>({ position: null, size: null });

  const currentPosition = useCallback((): Point => {
    const frame = frameRef.current!;
    const bounds = frame.getBoundingClientRect();
    const desktop = frame.parentElement!.getBoundingClientRect();
    return { x: bounds.left - desktop.left, y: bounds.top - desktop.top };
  }, []);

  const clamp = useCallback((value: Geometry): Geometry => {
    const frame = frameRef.current;
    const desktop = frame?.parentElement;
    if (!frame || !desktop) return value;
    const maxWidth = Math.max(1, desktop.clientWidth - margin * 2);
    const maxHeight = Math.max(1, desktop.clientHeight - margin * 2);
    const size = value.size ? {
      width: Math.max(Math.min(520, maxWidth), Math.min(value.size.width, maxWidth)),
      height: Math.max(Math.min(360, maxHeight), Math.min(value.size.height, maxHeight)),
    } : null;
    const point = value.position ?? currentPosition();
    const position = {
      x: Math.max(margin, Math.min(point.x, desktop.clientWidth - (size?.width ?? frame.offsetWidth) - margin)),
      y: Math.max(margin, Math.min(point.y, desktop.clientHeight - (size?.height ?? frame.offsetHeight) - margin)),
    };
    // Keep the initial CSS centering until coordinates actually need clamping.
    const samePosition = position.x === point.x && position.y === point.y;
    const sameSize = size?.width === value.size?.width && size?.height === value.size?.height;
    if (samePosition && sameSize) return value;
    return { position: samePosition ? value.position : position, size };
  }, [currentPosition]);

  const endGesture = useCallback((cancel = false) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    gestureRef.current = null;
    if (cancel) setGeometry(clamp(gesture.previous));
    if (gesture.handle.hasPointerCapture(gesture.pointerId)) {
      gesture.handle.releasePointerCapture(gesture.pointerId);
    }
  }, [clamp]);

  useEffect(() => {
    const frame = frameRef.current;
    const desktop = frame?.parentElement;
    if (!frame || !desktop) return;
    const viewport = window.matchMedia(desktopQuery);
    function reconcile() {
      // Mobile flows naturally; maximization must not overwrite restored geometry.
      if (disabled || !viewport.matches || !frame?.offsetWidth) return;
      setGeometry(previous => clamp(previous));
    }
    function viewportChanged() {
      endGesture();
      reconcile();
    }
    const observer = new ResizeObserver(entries => {
      if (entries.some(entry => entry.target === desktop)) endGesture();
      reconcile();
    });
    observer.observe(desktop);
    observer.observe(frame);
    viewport.addEventListener("change", viewportChanged);
    return () => {
      observer.disconnect();
      viewport.removeEventListener("change", viewportChanged);
      endGesture();
    };
  }, [clamp, disabled, endGesture]);

  const canChange = () => !disabled && window.matchMedia(desktopQuery).matches;
  function center() {
    endGesture();
    const frame = frameRef.current;
    const desktop = frame?.parentElement;
    if (!canChange() || !frame || !desktop) return;
    setGeometry(previous => clamp({ ...previous, position: {
      x: (desktop.clientWidth - frame.offsetWidth) / 2 + 45,
      y: (desktop.clientHeight - frame.offsetHeight) / 2,
    } }));
  }

  // Resizing anchors the top-left corner; each axis has an independent limit.
  function resize(origin: Point, desired: Size) {
    const desktop = frameRef.current!.parentElement!;
    const maxWidth = Math.max(1, desktop.clientWidth - origin.x - margin);
    const maxHeight = Math.max(1, desktop.clientHeight - origin.y - margin);
    setGeometry({ position: origin, size: {
      width: Math.max(Math.min(520, maxWidth), Math.min(desired.width, maxWidth)),
      height: Math.max(Math.min(360, maxHeight), Math.min(desired.height, maxHeight)),
    } });
  }

  function start(event: PointerEvent<HTMLElement>, mode: Gesture["mode"]) {
    if (!canChange() || !event.isPrimary || event.button !== 0 || gestureRef.current) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    const frame = frameRef.current!;
    gestureRef.current = {
      mode, pointerId: event.pointerId, origin: currentPosition(),
      size: { width: frame.offsetWidth, height: frame.offsetHeight },
      previous: geometry,
      pointer: { x: event.clientX, y: event.clientY }, handle: event.currentTarget,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const dx = event.clientX - gesture.pointer.x;
    const dy = event.clientY - gesture.pointer.y;
    if (gesture.mode === "resize") {
      resize(gesture.origin, { width: gesture.size.width + dx, height: gesture.size.height + dy });
    } else {
      setGeometry(previous => clamp({ ...previous, position: { x: gesture.origin.x + dx, y: gesture.origin.y + dy } }));
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>, mode: Gesture["mode"]) {
    if (event.key === "Escape" && gestureRef.current) {
      event.preventDefault();
      endGesture(true);
      return;
    }
    if (!canChange() || event.altKey || event.ctrlKey || event.metaKey) return;
    if (mode === "move" && event.key === "Home") {
      event.preventDefault();
      center();
      return;
    }
    const directions: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const step = event.shiftKey ? 1 : 10;
    const current = currentPosition();
    if (mode === "resize") {
      const frame = frameRef.current!;
      resize(current, { width: frame.offsetWidth + direction.x * step, height: frame.offsetHeight + direction.y * step });
    } else {
      setGeometry(previous => clamp({ ...previous, position: { x: current.x + direction.x * step, y: current.y + direction.y * step } }));
    }
  }

  const style = {
    ...(geometry.position && { "--window-x": `${geometry.position.x}px`, "--window-y": `${geometry.position.y}px` }),
    ...(geometry.size && { "--window-width": `${geometry.size.width}px`, "--window-height": `${geometry.size.height}px` }),
  } as CSSProperties;

  const sharedProps = {
    onPointerMove,
    onPointerUp: () => endGesture(),
    onPointerCancel: () => endGesture(true),
    onLostPointerCapture: () => endGesture(),
  };

  return {
    frameRef, style, positioned: geometry.position !== null, center,
    handleProps: {
      ...sharedProps,
      onPointerDown: (event: PointerEvent<HTMLElement>) => start(event, "move"),
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => onKeyDown(event, "move"),
    },
    resizeProps: {
      ...sharedProps,
      onPointerDown: (event: PointerEvent<HTMLElement>) => start(event, "resize"),
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => onKeyDown(event, "resize"),
    },
  };
}
