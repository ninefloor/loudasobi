"use client";

import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";

export function useLyricFollow(
  activeIndex: number,
  viewportRef: RefObject<HTMLDivElement | null>,
) {
  const [mode, setMode] = useState<"following" | "paused" | "off">("following");

  const center = useCallback(
    (index: number) => {
      const viewport = viewportRef.current;
      const row = viewport?.querySelector<HTMLElement>(
        `[data-line-index="${index}"]`,
      );
      if (!viewport || !row) return;
      const top =
        viewport.scrollTop +
        row.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top -
        viewport.clientHeight / 2 +
        row.clientHeight / 2;
      viewport.scrollTo({
        top: Math.max(0, top),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    },
    [viewportRef],
  );

  const suspend = useCallback(() => {
    setMode((current) => (current === "following" ? "paused" : current));
    const viewport = viewportRef.current;
    if (viewport)
      viewport.scrollTo({ top: viewport.scrollTop, behavior: "instant" });
  }, [viewportRef]);

  useEffect(() => {
    if (mode === "following" && activeIndex >= 0) center(activeIndex);
  }, [activeIndex, mode, center]);

  return {
    mode,
    center,
    resume: () => {
      setMode("following");
      center(activeIndex);
    },
    toggle: () => {
      const viewport = viewportRef.current;
      if (viewport)
        viewport.scrollTo({ top: viewport.scrollTop, behavior: "instant" });
      setMode((current) => (current === "off" ? "following" : "off"));
    },
    manualHandlers: {
      onWheelCapture: suspend,
      onTouchMoveCapture: suspend,
      onPointerDownCapture: (event: PointerEvent<HTMLElement>) => {
        if (
          (event.target as HTMLElement).closest(
            '[data-slot="scroll-area-scrollbar"]',
          )
        )
          suspend();
      },
      onKeyDownCapture: (event: KeyboardEvent<HTMLElement>) => {
        if (
          [
            "ArrowUp",
            "ArrowDown",
            "PageUp",
            "PageDown",
            "Home",
            "End",
          ].includes(event.key) ||
          (event.key === " " && event.target === viewportRef.current)
        )
          suspend();
      },
    },
  };
}
