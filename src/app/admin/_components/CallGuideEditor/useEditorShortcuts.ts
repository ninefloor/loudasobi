"use client";
import { useEffect } from "react";
import type { Playback } from "@/components/player/MusicExperience/usePlayback";

export function useEditorShortcuts({ ready, toggle, seekBy }: Playback) {
  useEffect(() => {
    function handle(event: KeyboardEvent) {
      if (event.isComposing || event.metaKey || event.ctrlKey || event.altKey)
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest(
              'input, textarea, select, [role="combobox"], [role="listbox"], [data-text-selection]',
          ))
      )
        return;
      const space = event.code === "Space";
      const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";
      const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
      if (!space && !backward && !forward) return;
      // Capture before focused buttons/sliders can click or move themselves.
      event.preventDefault();
      event.stopPropagation();
      if (!ready || event.type !== "keydown") return;
      if (space) {
        if (!event.repeat) toggle();
      } else seekBy(backward ? -0.01 : 0.01);
    }
    window.addEventListener("keydown", handle, true);
    window.addEventListener("keyup", handle, true);
    return () => {
      window.removeEventListener("keydown", handle, true);
      window.removeEventListener("keyup", handle, true);
    };
  }, [ready, toggle, seekBy]);
}
