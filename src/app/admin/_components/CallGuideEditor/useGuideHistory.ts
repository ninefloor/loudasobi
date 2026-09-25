"use client";
import { useState } from "react";
import type { CallGuide } from "@/lib/callGuide";
export type GuideDraft = { guide: CallGuide; syncOffset: number };
export function useGuideHistory(initial: GuideDraft) {
  const [state, setState] = useState({
    past: [] as GuideDraft[],
    present: initial,
    future: [] as GuideDraft[],
  });
  return {
    draft: state.present,
    canUndo: !!state.past.length,
    canRedo: !!state.future.length,
    update: (change: (draft: GuideDraft) => GuideDraft) =>
      setState((current) => {
        const next = change(current.present);
        return JSON.stringify(next) === JSON.stringify(current.present)
          ? current
          : {
              past: [...current.past.slice(-99), current.present],
              present: next,
              future: [],
            };
      }),
    undo: () =>
      setState((current) =>
        current.past.length
          ? {
              past: current.past.slice(0, -1),
              present: current.past.at(-1)!,
              future: [current.present, ...current.future],
            }
          : current,
      ),
    redo: () =>
      setState((current) =>
        current.future.length
          ? {
              past: [...current.past, current.present],
              present: current.future[0],
              future: current.future.slice(1),
            }
          : current,
      ),
  };
}
