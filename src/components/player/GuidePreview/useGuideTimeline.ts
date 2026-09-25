"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type RefObject,
} from "react";
import type { CallSection, LyricLine } from "@/types/lyric";
import type { PlaybackClock } from "../MusicExperience/playbackClock";
import { activeLineAt, upperBound } from "./timeline";

export function useGuideTimeline(
  clock: PlaybackClock,
  lines: readonly LyricLine[],
  sections: readonly CallSection[],
  offset: number,
  viewportRef: RefObject<HTMLDivElement | null>,
) {
  const starts = useMemo(() => lines.map((line) => line.start), [lines]);
  const sectionByLine = useMemo(() => {
    const mapped: CallSection[][] = Array.from(
      { length: lines.length },
      () => [],
    );
    for (const section of sections) {
      lines.forEach((line, index) => {
        if (section.start < line.end && section.end > line.start)
          mapped[index].push(section);
      });
    }
    return mapped;
  }, [lines, sections]);
  const hits = useMemo(
    () =>
      Array.from(
        new Set(sections.flatMap((section) => section.pulseTimes)),
      ).sort((a, b) => a - b),
    [sections],
  );
  const snapshot = useCallback(
    () => activeLineAt(lines, starts, clock.read().time - offset),
    [clock, lines, starts, offset],
  );
  const subscribe = useCallback(
    (notify: () => void) => {
      let previous = snapshot();
      return clock.subscribeFrame(() => {
        const next = snapshot();
        if (next !== previous) {
          previous = next;
          notify();
        }
      });
    },
    [clock, snapshot],
  );
  const activeIndex = useSyncExternalStore(subscribe, snapshot, () => -1);

  useEffect(() => {
    let previousTime = clock.read().time - offset;
    let animation: Animation | null = null;
    let animatedLine = -1;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cancel = () => {
      animation?.cancel();
      animation = null;
      animatedLine = -1;
    };
    reduced.addEventListener("change", cancel);
    const unsubscribe = clock.subscribeFrame((sample) => {
      const time = sample.time - offset;
      const previous = previousTime;
      previousTime = time;
      if (
        sample.reset ||
        !sample.running ||
        time < previous ||
        time - previous > 0.5
      ) {
        cancel();
        return;
      }
      const lineIndex = activeLineAt(lines, starts, time);
      if (animatedLine !== lineIndex) cancel();
      const hitIndex = upperBound(hits, time) - 1;
      const hit = hits[hitIndex];
      if (hit === undefined || hit <= previous || time - hit > 0.14) return;
      // A late frame must not flash the next lyric for the previous line's hit.
      if (activeLineAt(lines, starts, hit) !== lineIndex) return;
      const row = viewportRef.current?.querySelector<HTMLElement>(
        `[data-line-index="${lineIndex}"] button`,
      );
      if (!row) return;
      cancel();
      animatedLine = lineIndex;
      animation = row.animate(
        reduced.matches
          ? [
              { outline: "2px solid var(--primary)", outlineOffset: "-2px" },
              { outline: "2px solid transparent", outlineOffset: "-2px" },
            ]
          : [
              {
                boxShadow: "inset 0 0 0 2px var(--primary)",
                backgroundColor:
                  "color-mix(in oklch, var(--primary) 20%, var(--background))",
              },
              {
                boxShadow: "inset 0 0 0 2px var(--primary)",
                backgroundColor:
                  "color-mix(in oklch, var(--primary) 20%, var(--background))",
                offset: 0.35,
              },
              { boxShadow: "inset 0 0 0 0 transparent" },
            ],
        { duration: reduced.matches ? 180 : 380, easing: "ease-out" },
      );
    });
    return () => {
      unsubscribe();
      cancel();
      reduced.removeEventListener("change", cancel);
    };
  }, [clock, lines, starts, hits, offset, viewportRef]);

  return { activeIndex, sectionByLine };
}
