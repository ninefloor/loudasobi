"use client";
import { useRef, useState, type PointerEvent, type RefObject } from "react";
import { moveCue, resizeCue, roundTime, type CallCue } from "@/lib/callGuide";
type Drag = {
  pointer: number;
  y: number;
  scroll: number;
  kind: "create" | "move" | "start" | "end";
  cue?: CallCue;
  start: number;
  end: number;
};
const previewCue = (drag: Drag | null) =>
  drag?.cue && drag.kind !== "create"
    ? drag.kind === "move"
      ? moveCue(drag.cue, drag.start - drag.cue.start)
      : resizeCue(
          drag.cue,
          drag.kind,
          drag.kind === "start" ? drag.start : drag.end,
        )
    : undefined;

// MONOASOBI's pixel/time drag model, adapted to Y and independent overlapping calls.
export function useTimelineDrag({
  canvas,
  viewport,
  disabled,
  scale,
  sync,
  origin,
  limit,
  onSelect,
  onCreate,
  onChange,
}: {
  canvas: RefObject<HTMLDivElement | null>;
  viewport: RefObject<HTMLDivElement | null>;
  disabled: boolean;
  scale: number;
  sync: number;
  origin: number;
  limit: number;
  onSelect: (id: string) => void;
  onCreate: (start: number, end: number) => void;
  onChange: (cue: CallCue) => void;
}) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const anchor = useRef<Drag | null>(null);
  const latest = useRef<Drag | null>(null);
  function cancel() {
    const pointer = anchor.current?.pointer;
    anchor.current = null;
    latest.current = null;
    setDrag(null);
    if (pointer !== undefined && canvas.current?.hasPointerCapture(pointer))
      canvas.current.releasePointerCapture(pointer);
  }
  function start(
    event: PointerEvent<HTMLElement>,
    kind: Drag["kind"],
    cue?: CallCue,
  ) {
    if (
      disabled ||
      event.button !== 0 ||
      !event.isPrimary ||
      !canvas.current ||
      anchor.current
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    // Keep capture on the stable canvas while the selected block/handles move.
    canvas.current.setPointerCapture(event.pointerId);
    const time = roundTime(
      Math.max(
        -sync,
        Math.min(
          limit - sync,
          (event.clientY - canvas.current.getBoundingClientRect().top) / scale +
            origin -
            sync,
        ),
      ),
    );
    const next = {
      pointer: event.pointerId,
      y: event.clientY,
      scroll: viewport.current?.scrollTop ?? 0,
      kind,
      cue,
      start: cue?.start ?? time,
      end: cue?.end ?? time,
    };
    if (cue) onSelect(cue.id);
    anchor.current = next;
    latest.current = next;
    setDrag(next);
  }
  function move(event: PointerEvent<HTMLElement>) {
    const state = anchor.current;
    if (!state || state.pointer !== event.pointerId || disabled) return;
    const node = viewport.current;
    if (node) {
      const rect = node.getBoundingClientRect();
      if (event.clientY > rect.bottom - 30)
        node.scrollBy({ top: 12, behavior: "instant" });
      else if (event.clientY < rect.top + 30)
        node.scrollBy({ top: -12, behavior: "instant" });
    }
    const delta =
      (event.clientY - state.y + (node?.scrollTop ?? 0) - state.scroll) / scale;
    let next = { ...state };
    if (state.kind === "create")
      next.end = roundTime(
        Math.max(-sync, Math.min(limit - sync, state.start + delta)),
      );
    else if (state.cue) {
      const cue = state.cue;
      if (state.kind === "move") {
        const d = Math.max(
          -sync - cue.start,
          Math.min(delta, limit - sync - cue.end),
        );
        next = {
          ...state,
          start: roundTime(cue.start + d),
          end: roundTime(cue.end + d),
        };
      }
      if (state.kind === "start")
        next.start = roundTime(
          Math.max(-sync, Math.min(cue.end - 0.01, cue.start + delta)),
        );
      if (state.kind === "end")
        next.end = roundTime(
          Math.max(cue.start + 0.01, Math.min(limit - sync, cue.end + delta)),
        );
    }
    latest.current = next;
    setDrag(next);
  }
  function finish(event: PointerEvent<HTMLElement>) {
    const current = latest.current;
    if (!current || current.pointer !== event.pointerId) return;
    if (!disabled) {
      if (
        current.kind === "create" &&
        roundTime(Math.abs(current.end - current.start)) >= 0.01
      )
        onCreate(
          Math.min(current.start, current.end),
          Math.max(current.start, current.end),
        );
      else {
        const next = previewCue(current);
        if (
          next &&
          (next.start !== current.cue?.start || next.end !== current.cue?.end)
        )
          onChange(next);
      }
    }
    cancel();
  }
  return { drag, preview: previewCue(drag), start, move, finish, cancel };
}
