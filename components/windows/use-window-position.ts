"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

type Point = { x: number; y: number };
type Drag = {
  pointerId: number;
  origin: Point;
  pointer: Point;
  handle: HTMLDivElement;
};

// Geometry belongs to the outer positioning element, never the 7.css skin.
export function useWindowPosition(disabled: boolean) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const [position, setPosition] = useState<Point | null>(null);

  const clamp = useCallback((point: Point): Point => {
    const frame = frameRef.current;
    const desktop = frame?.parentElement;
    if (!frame || !desktop) return point;
    return {
      x: Math.max(8, Math.min(point.x, desktop.clientWidth - frame.offsetWidth - 8)),
      y: Math.max(8, Math.min(point.y, desktop.clientHeight - frame.offsetHeight - 8)),
    };
  }, []);

  const currentPosition = () => {
    const frame = frameRef.current!;
    const bounds = frame.getBoundingClientRect();
    const desktop = frame.parentElement!.getBoundingClientRect();
    return { x: bounds.left - desktop.left, y: bounds.top - desktop.top };
  };

  const endDrag = useCallback((cancel = false) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (cancel) setPosition(clamp(drag.origin));
    if (drag.handle.hasPointerCapture(drag.pointerId)) {
      drag.handle.releasePointerCapture(drag.pointerId);
    }
  }, [clamp]);

  useEffect(() => {
    const frame = frameRef.current;
    const desktop = frame?.parentElement;
    if (!frame || !desktop) return;
    const viewport = window.matchMedia("(min-width: 701px)");
    function resize() {
      endDrag();
      // Mobile has its own flowing layout. Keep desktop coordinates in memory.
      if (disabled || !viewport.matches || !frame?.offsetWidth) return;
      setPosition(previous => {
        if (!previous) return previous;
        const next = clamp(previous);
        return next.x === previous.x && next.y === previous.y ? previous : next;
      });
    }
    const observer = new ResizeObserver(resize);
    observer.observe(desktop);
    observer.observe(frame);
    viewport.addEventListener("change", resize);
    return () => {
      observer.disconnect();
      viewport.removeEventListener("change", resize);
      endDrag();
    };
  }, [clamp, disabled, endDrag]);

  const canMove = () => !disabled && window.matchMedia("(min-width: 701px)").matches;
  const center = () => { endDrag(); setPosition(null); };

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!canMove() || !event.isPrimary || event.button !== 0 || dragRef.current) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    dragRef.current = {
      pointerId: event.pointerId,
      origin: currentPosition(),
      pointer: { x: event.clientX, y: event.clientY },
      handle: event.currentTarget,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPosition(clamp({
      x: drag.origin.x + event.clientX - drag.pointer.x,
      y: drag.origin.y + event.clientY - drag.pointer.y,
    }));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && dragRef.current) {
      event.preventDefault();
      endDrag(true);
      return;
    }
    if (!canMove() || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "Home") {
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
    const current = currentPosition();
    const step = event.shiftKey ? 1 : 10;
    setPosition(clamp({ x: current.x + direction.x * step, y: current.y + direction.y * step }));
  }

  const style = position ? {
    "--window-x": `${position.x}px`, "--window-y": `${position.y}px`,
  } as CSSProperties : undefined;

  return {
    frameRef, style, positioned: position !== null, center,
    handleProps: {
      onPointerDown, onPointerMove, onKeyDown,
      onPointerUp: () => endDrag(),
      onPointerCancel: () => endDrag(true),
      onLostPointerCapture: () => endDrag(),
    },
  };
}
