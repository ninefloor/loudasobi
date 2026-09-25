"use client";
import { useMemo, useRef, useState } from "react";
import { useTimelineDrag } from "./useTimelineDrag";
import { useTimelinePlayback } from "./useTimelinePlayback";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { cuePulses, type CallCue } from "@/lib/callGuide";
import type { LyricLine } from "@/types/lyric";
import type { Playback } from "@/components/player/MusicExperience/usePlayback";
import {
  callLabels,
  callStyles,
} from "@/components/player/GuidePreview/guideStyles";

export function VerticalTimeline({
  lines,
  cues,
  sync,
  playback,
  selectedId,
  selectedLines,
  disabled,
  onSelect,
  onLines,
  onCreate,
  onChange,
}: {
  lines: LyricLine[];
  cues: CallCue[];
  sync: number;
  playback: Playback;
  selectedId: string | null;
  selectedLines: number[];
  disabled: boolean;
  onSelect: (id: string) => void;
  onLines: (indexes: number[]) => void;
  onCreate: (start: number, end: number) => void;
  onChange: (cue: CallCue) => void;
}) {
  const [scale, setScale] = useState(48);
  const viewport = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const selectionAnchor = useRef(0);
  const bottom =
    Math.max(
      10,
      playback.duration || 180,
      ...lines.map((line) => line.end + sync),
      ...cues.map((cue) => cue.end + sync),
    ) + (playback.duration ? 0 : 10);
  const origin = Math.min(
    0,
    ...lines.map((line) => line.start + sync),
    ...cues.map((cue) => cue.start + sync),
  );
  const y = (time: number) => (time + sync - origin) * scale;
  const { drag, preview, start, move, finish, cancel } = useTimelineDrag({
    canvas,
    viewport,
    disabled,
    scale,
    sync,
    origin,
    limit: playback.duration || bottom,
    onSelect,
    onCreate,
    onChange,
  });
  const { playhead, cueNodes } = useTimelinePlayback(
    playback.clock,
    cues,
    sync,
    origin,
    scale,
  );
  const shown = preview
    ? cues.map((cue) => (cue.id === preview.id ? preview : cue))
    : cues;
  const lanes = useMemo(() => {
    const ends: number[] = [];
    const indexes = new Map<string, number>();
    [...cues]
      .sort((a, b) => a.start - b.start)
      .forEach((cue) => {
        let lane = ends.findIndex((end) => end <= cue.start);
        if (lane < 0) lane = ends.length;
        ends[lane] = cue.end;
        indexes.set(cue.id, lane);
      });
    return { indexes, count: Math.max(1, ends.length) };
  }, [cues]);
  function zoom(next: number) {
    const node = viewport.current;
    const time = node ? (node.scrollTop + node.clientHeight / 2) / scale : 0;
    setScale(next);
    requestAnimationFrame(() => {
      if (node) node.scrollTop = time * next - node.clientHeight / 2;
    });
  }
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b p-2">
        <Button
          size="xs"
          variant="outline"
          disabled={scale <= 24}
          onClick={() => zoom(Math.max(24, scale - 12))}
        >
          축소
        </Button>
        <span className="text-xs">{scale}px/초</span>
        <Button
          size="xs"
          variant="outline"
          disabled={scale >= 144}
          onClick={() => zoom(Math.min(144, scale + 12))}
        >
          확대
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => {
            const node = viewport.current;
            if (node)
              node.scrollTop =
                (playback.clock.read().time - origin) * scale -
                node.clientHeight / 2;
          }}
        >
          재생 위치로
        </Button>
        <span className="text-xs text-muted-foreground">
          시간 눈금 클릭으로 탐색 / 가사 클릭·Shift 선택 / 빈 콜 영역 드래그로
          생성 / 블록 드래그로 이동 · 위아래 손잡이로 길이 조절
        </span>
      </div>
      <ScrollArea className="min-h-0 flex-1" viewportRef={viewport}>
        <div className="sticky top-0 z-20 grid grid-cols-[60px_1fr_1fr] border-b bg-background p-2 text-xs">
          <span>시간</span>
          <span>원본 가사 · 읽기 전용</span>
          <span>콜 트랙</span>
        </div>
        <div
          ref={canvas}
          className="relative ml-[60px] mr-2"
          style={{ height: (bottom - origin) * scale }}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={cancel}
          onLostPointerCapture={cancel}
        >
          {Array.from({ length: Math.ceil((bottom - origin) / 2) }, (_, i) => {
            const time = origin + i * 2;
            return (
              <div
                key={i}
                className="pointer-events-none absolute inset-x-0 border-t border-border/60"
                style={{ top: i * 2 * scale }}
              >
                <button
                  type="button"
                  className="pointer-events-auto absolute -left-[60px] z-10 flex w-[60px] cursor-pointer select-none items-start justify-center text-xs tabular-nums text-muted-foreground hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default"
                  style={{ height: Math.min(2, bottom - time) * scale }}
                  aria-label={`${time.toFixed(2)}초로 이동`}
                  disabled={!playback.ready}
                  onClick={(event) => {
                    const top = canvas.current?.getBoundingClientRect().top;
                    const target =
                      event.detail === 0 || top === undefined
                        ? time
                        : origin + (event.clientY - top) / scale;
                    playback.seek(
                      Math.max(
                        0,
                        Math.min(playback.duration || bottom, target),
                      ),
                    );
                  }}
                >
                  {time.toFixed(0)}s
                </button>
              </div>
            );
          })}
          <div
            className="absolute inset-y-0 left-1/2 right-0 touch-none border-l"
            aria-label="콜 생성 영역"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) start(event, "create");
            }}
          />
          {lines.map((line, index) => (
            <button
              type="button"
              key={line.id ?? index}
              title={`${line.jp} · ${(line.start + sync).toFixed(2)}초`}
              aria-pressed={selectedLines.includes(index)}
              className={cn(
                "absolute left-0 w-[calc(50%-6px)] overflow-hidden rounded border bg-card px-2 text-left text-xs",
                selectedLines.includes(index) &&
                  "border-cyan-500 bg-cyan-100 dark:bg-cyan-900",
              )}
              style={{
                top: y(line.start),
                height: Math.max(4, (line.end - line.start) * scale),
              }}
              onClick={(event) => {
                if (event.shiftKey)
                  onLines(
                    Array.from(
                      { length: Math.abs(index - selectionAnchor.current) + 1 },
                      (_, i) => Math.min(index, selectionAnchor.current) + i,
                    ),
                  );
                else {
                  selectionAnchor.current = index;
                  onLines([index]);
                }
              }}
            >
              {line.jp}
            </button>
          ))}
          {shown.map((cue) => (
            <div
              key={cue.id}
              className="absolute"
              style={{
                top: y(cue.start),
                height: Math.max(4, (cue.end - cue.start) * scale),
                left: `${50 + ((lanes.indexes.get(cue.id) ?? 0) * 50) / lanes.count}%`,
                width: `${50 / lanes.count}%`,
              }}
            >
              <button
                ref={(node) => {
                  if (node) cueNodes.current.set(cue.id, node);
                  else cueNodes.current.delete(cue.id);
                }}
                type="button"
                aria-pressed={selectedId === cue.id}
                className={cn(
                  "absolute inset-0 w-full touch-none overflow-hidden rounded border px-2 py-1 text-left text-xs data-[active=true]:ring-2 data-[active=true]:ring-primary/60",
                  callStyles[cue.type],
                  selectedId === cue.id && "outline-2 outline-primary",
                  !disabled && "cursor-grab select-none active:cursor-grabbing",
                )}
                onPointerDown={(event) => start(event, "move", cue)}
                onClick={() => onSelect(cue.id)}
              >
                <span className="relative z-10">
                  {callLabels[cue.type]}
                  {cue.label && ` · ${cue.label}`}
                </span>
                {cuePulses(cue).map((time, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="pointer-events-none absolute left-0 h-0.5 w-full bg-primary/70"
                    style={{ top: (time - cue.start) * scale }}
                  />
                ))}
              </button>
              {selectedId === cue.id && !disabled && (
                <>
                  {(["start", "end"] as const).map((edge) => (
                    <button
                      key={edge}
                      type="button"
                      aria-label={
                        edge === "start"
                          ? "시작 시간 드래그"
                          : "종료 시간 드래그"
                      }
                      className={`absolute inset-x-0 z-10 h-2 cursor-ns-resize touch-none rounded bg-primary ${edge === "start" ? "-top-1" : "-bottom-1"}`}
                      onPointerDown={(event) => start(event, edge, cue)}
                    />
                  ))}
                </>
              )}
            </div>
          ))}
          {drag?.kind === "create" && (
            <div
              className="pointer-events-none absolute left-1/2 right-0 border-2 border-primary bg-primary/15"
              style={{
                top: y(Math.min(drag.start, drag.end)),
                height: Math.abs(drag.end - drag.start) * scale,
              }}
            />
          )}
          <div
            ref={playhead}
            aria-hidden
            className="pointer-events-none absolute top-0 inset-x-0 z-10 border-t-2 border-primary text-right text-[10px] text-primary"
          />
        </div>
      </ScrollArea>
    </section>
  );
}
