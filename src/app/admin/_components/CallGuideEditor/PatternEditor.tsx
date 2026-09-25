"use client";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { Playback } from "@/components/player/MusicExperience/usePlayback";
import {
  cuePulses,
  defaultPulsePattern,
  roundTime,
  type CallCue,
} from "@/lib/callGuide";
import { NumberField } from "./NumberField";

export function PatternEditor({
  cue,
  defaultBpm,
  sync,
  playback,
  disabled,
  onChange,
}: {
  cue: CallCue;
  defaultBpm?: number;
  sync: number;
  playback: Playback;
  disabled: boolean;
  onChange: (cue: CallCue) => void;
}) {
  const now =
    useSyncExternalStore(
      playback.clock.subscribeProgress,
      playback.clock.getProgress,
      playback.clock.getServerProgress,
    ) - sync;
  const pattern = cue.pattern;
  const pulses = cuePulses(cue);
  const patch = (change: Partial<NonNullable<CallCue["pattern"]>>) =>
    pattern &&
    onChange({ ...cue, pattern: { ...pattern, ...change }, pulseTimes: [] });
  const step = pattern
    ? Math.floor(
        (now - cue.start - pattern.firstOffset) /
          (60 / pattern.bpm / pattern.subdivision),
      )
    : -1;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="xs"
          variant={pattern ? "secondary" : "outline"}
          onClick={() =>
            !pattern &&
            onChange({
              ...cue,
              pulseTimes: [],
              pattern: defaultPulsePattern(defaultBpm),
            })
          }
        >
          8카운트 패턴
        </Button>
        <Button
          type="button"
          size="xs"
          variant={!pattern ? "secondary" : "outline"}
          onClick={() =>
            onChange({ ...cue, pattern: undefined, pulseTimes: pulses })
          }
        >
          개별 펄스
        </Button>
      </div>
      {pattern && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="BPM"
              value={pattern.bpm}
              min={20}
              max={400}
              step={0.1}
              onChange={(bpm) => patch({ bpm })}
            />
            <NumberField
              label="첫 박 (블록 시작 +초)"
              value={pattern.firstOffset}
              min={0}
              max={Math.max(0, cue.end - cue.start - 0.01)}
              onChange={(firstOffset) => patch({ firstOffset })}
            />
          </div>
          <Label htmlFor="pulse-subdivision">박 세분화</Label>
          <NativeSelect
            id="pulse-subdivision"
            value={pattern.subdivision}
            onChange={(event) =>
              patch({
                subdivision: Number(event.target.value) as 1 | 2,
                steps: pattern.steps
                  .map(
                    (value) =>
                      (value * Number(event.target.value)) /
                      pattern.subdivision,
                  )
                  .filter(Number.isInteger),
              })
            }
          >
            <NativeSelectOption value={1}>1박 단위 · 8칸</NativeSelectOption>
            <NativeSelectOption value={2}>반박 단위 · 16칸</NativeSelectOption>
          </NativeSelect>
          <div
            className="grid grid-cols-4 gap-2 sm:grid-cols-8"
            aria-label="펄스 카운트"
          >
            {Array.from({ length: 8 * pattern.subdivision }, (_, index) => (
              <label
                key={index}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded border p-1 text-xs ${now >= cue.start && now < cue.end && step >= 0 && step % (8 * pattern.subdivision) === index ? "bg-primary/20 ring-2 ring-primary" : "bg-card"}`}
              >
                {pattern.subdivision === 2 && index % 2
                  ? "&"
                  : Math.floor(index / pattern.subdivision) + 1}
                <Checkbox
                  disabled={disabled}
                  checked={pattern.steps.includes(index)}
                  aria-label={`${Math.floor(index / pattern.subdivision) + 1}${pattern.subdivision === 2 && index % 2 ? " 반박" : "박"}`}
                  onCheckedChange={(checked) =>
                    patch({
                      steps: checked
                        ? [...pattern.steps, index].sort((a, b) => a - b)
                        : pattern.steps.filter((value) => value !== index),
                    })
                  }
                />
              </label>
            ))}
          </div>
          <Button
            type="button"
            size="xs"
            variant="outline"
            disabled={
              480 / (cue.end - cue.start) < 20 ||
              480 / (cue.end - cue.start) > 400
            }
            onClick={() =>
              patch({
                bpm: roundTime(480 / (cue.end - cue.start)),
                firstOffset: 0,
              })
            }
          >
            선택 구간을 정확히 8박으로 맞추기
          </Button>
          <p className="text-xs text-muted-foreground">
            BPM 간격으로 구간 끝까지 반복합니다. 블록 길이를 바꿔도 BPM은
            유지합니다.
          </p>
        </>
      )}
      <div
        className="relative h-12 overflow-hidden rounded border bg-muted/30"
        role="group"
        aria-label="펄스 위치 · 개별 모드에서 빈 곳 클릭으로 추가"
        onClick={(event) => {
          if (disabled || pattern || event.target !== event.currentTarget)
            return;
          const rect = event.currentTarget.getBoundingClientRect();
          const time = roundTime(
            cue.start +
              ((event.clientX - rect.left) / rect.width) *
                (cue.end - cue.start),
          );
          if (time < cue.end)
            onChange({
              ...cue,
              pulseTimes: [...new Set([...pulses, time])].sort((a, b) => a - b),
            });
        }}
      >
        {pulses.map((time, index) => (
          <button
            key={`${time}:${index}`}
            type="button"
            disabled={disabled || !!pattern}
            aria-label={`${(time + sync).toFixed(2)}초 펄스 삭제`}
            title={`${(time + sync).toFixed(2)}초`}
            className="absolute top-1 h-9 w-2 -translate-x-1/2 rounded bg-primary disabled:opacity-70"
            style={{
              left: `${((time - cue.start) / (cue.end - cue.start)) * 100}%`,
            }}
            onClick={() =>
              onChange({
                ...cue,
                pulseTimes: pulses.filter((_, i) => index !== i),
              })
            }
          />
        ))}
        {now >= cue.start && now < cue.end && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-0.5 bg-foreground"
            style={{
              left: `${((now - cue.start) / (cue.end - cue.start)) * 100}%`,
            }}
          />
        )}
      </div>
      {!pattern && (
        <>
          <Button
            size="xs"
            variant="outline"
            disabled={!playback.ready || now < cue.start || now >= cue.end}
            onClick={() =>
              onChange({
                ...cue,
                pulseTimes: [...new Set([...pulses, roundTime(now)])].sort(
                  (a, b) => a - b,
                ),
              })
            }
          >
            현재 재생 위치에 펄스 추가
          </Button>
          <div className="max-h-36 space-y-2 overflow-y-auto">
            {pulses.map((time, index) => (
              <div key={`${index}:${time}`} className="flex items-end gap-2">
                <NumberField
                  label={`펄스 ${index + 1} (재생 초)`}
                  value={roundTime(time + sync)}
                  min={cue.start + sync}
                  max={cue.end + sync - 0.0001}
                  step={0.01}
                  onChange={(value) =>
                    onChange({
                      ...cue,
                      pulseTimes: [
                        ...new Set(
                          pulses.map((hit, i) =>
                            i === index ? roundTime(value - sync) : hit,
                          ),
                        ),
                      ].sort((a, b) => a - b),
                    })
                  }
                />
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() =>
                    onChange({
                      ...cue,
                      pulseTimes: pulses.filter((_, i) => i !== index),
                    })
                  }
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="text-xs text-muted-foreground">
        펄스 {pulses.length}개 · 저장 전 변경은 미리보기에만 적용됩니다.
      </p>
    </div>
  );
}
