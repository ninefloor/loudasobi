"use client";
import { useEffect, useRef } from "react";
import { cuePulses, type CallCue } from "@/lib/callGuide";
import type { PlaybackClock } from "@/components/player/MusicExperience/playbackClock";
import { upperBound } from "@/components/player/GuidePreview/timeline";

export function useTimelinePlayback(
  clock: PlaybackClock,
  cues: CallCue[],
  sync: number,
  origin: number,
  scale: number,
) {
  const playhead = useRef<HTMLDivElement>(null);
  const cueNodes = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => {
    let previous = clock.read().time - sync;
    const animations = new Map<string, Animation>();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hits = cues.map((cue) => ({ cue, pulses: cuePulses(cue) }));
    const cancel = () => {
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
    const update = (sample: ReturnType<typeof clock.read>) => {
      const time = sample.time - sync;
      if (playhead.current) {
        playhead.current.style.transform = `translateY(${(sample.time - origin) * scale}px)`;
        playhead.current.textContent = `${sample.time.toFixed(2)}s`;
      }
      const reset =
        sample.reset ||
        !sample.running ||
        time < previous ||
        time - previous > 0.5;
      if (reset) cancel();
      for (const { cue, pulses } of hits) {
        const node = cueNodes.current.get(cue.id);
        if (!node) continue;
        node.dataset.active = String(time >= cue.start && time < cue.end);
        const hit = pulses[upperBound(pulses, time) - 1];
        if (
          !reset &&
          hit !== undefined &&
          hit > previous &&
          time - hit < 0.14 &&
          time < cue.end
        ) {
          animations.get(cue.id)?.cancel();
          animations.set(
            cue.id,
            node.animate(
              reduce.matches
                ? [
                    {
                      outline: "2px solid var(--primary)",
                      outlineOffset: "-2px",
                    },
                    { outline: "2px solid transparent", outlineOffset: "-2px" },
                  ]
                : [
                    {
                      boxShadow: "inset 0 0 0 3px var(--primary)",
                      backgroundColor:
                        "color-mix(in oklch, var(--primary) 35%, var(--background))",
                    },
                    { boxShadow: "inset 0 0 0 0 transparent" },
                  ],
              { duration: reduce.matches ? 150 : 350 },
            ),
          );
        }
      }
      previous = time;
    };
    update(clock.read());
    const stop = clock.subscribeFrame(update);
    reduce.addEventListener("change", cancel);
    return () => {
      stop();
      cancel();
      reduce.removeEventListener("change", cancel);
    };
  }, [clock, cues, sync, origin, scale]);
  return { playhead, cueNodes };
}
