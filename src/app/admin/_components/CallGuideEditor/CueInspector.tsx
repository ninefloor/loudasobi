"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { callLabels } from "@/components/player/GuidePreview/guideStyles";
import type { Playback } from "@/components/player/MusicExperience/usePlayback";
import { moveCue, resizeCue, roundTime, type CallCue } from "@/lib/callGuide";
import { NumberField } from "./NumberField";
import { PatternEditor } from "./PatternEditor";
import { SingalongTextEditor } from "./SingalongTextEditor";
import type { LyricLine } from "@/types/lyric";

export function CueInspector({
  cue,
  lines,
  defaultBpm,
  sync,
  playback,
  disabled,
  issue,
  onChange,
  onDelete,
  loop,
  onLoop,
}: {
  cue: CallCue;
  lines: LyricLine[];
  defaultBpm?: number;
  sync: number;
  playback: Playback;
  disabled: boolean;
  issue?: string;
  onChange: (cue: CallCue) => void;
  onDelete: () => void;
  loop: boolean;
  onLoop: () => void;
}) {
  return (
    <div className="space-y-4 p-4">
      <h2 className="font-medium">{callLabels[cue.type]} 블록</h2>
      {issue && (
        <p role="alert" className="text-xs text-destructive">
          {issue}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          size="xs"
          variant="outline"
          disabled={!playback.ready}
          onClick={() => playback.seek(Math.max(0, cue.start + sync - 1), true)}
        >
          1초 전부터 재생
        </Button>
        <Button
          size="xs"
          variant={loop ? "secondary" : "outline"}
          disabled={!playback.ready}
          onClick={onLoop}
        >
          구간 반복 {loop ? "ON" : "OFF"}
        </Button>
      </div>
      <fieldset disabled={disabled} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="cue-label">콜 내용 / 설명</Label>
          <Input
            id="cue-label"
            value={cue.label}
            maxLength={200}
            onChange={(event) =>
              onChange({ ...cue, label: event.target.value })
            }
            placeholder="예: 어이!"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="시작 (재생 초)"
            value={roundTime(cue.start + sync)}
            min={0}
            max={cue.end + sync - 0.01}
            onChange={(value) =>
              onChange(resizeCue(cue, "start", value - sync))
            }
          />
          <NumberField
            label="끝 (재생 초)"
            value={roundTime(cue.end + sync)}
            min={cue.start + sync + 0.01}
            max={playback.duration || 86400}
            onChange={(value) => onChange(resizeCue(cue, "end", value - sync))}
          />
        </div>
        <div className="space-y-2 rounded-lg border p-3">
          <p className="text-sm font-medium">콜 블록 위치 조절</p>
          <div className="flex flex-wrap gap-1">
            {[-0.1, -0.05, -0.01, 0.01, 0.05, 0.1].map((delta) => (
              <Button
                key={delta}
                size="xs"
                variant="outline"
                disabled={
                  cue.start + sync + delta < 0 ||
                  (playback.duration > 0 &&
                    cue.end + sync + delta > playback.duration)
                }
                onClick={() => onChange(moveCue(cue, delta))}
              >
                {delta > 0 ? "+" : ""}
                {delta.toFixed(2)}초
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            이 블록과 내부 펄스만 함께 이동합니다. 곡 전체 싱크는 바뀌지
            않습니다.
          </p>
        </div>
        {cue.type === "singalong" && (
          <SingalongTextEditor cue={cue} lines={lines} disabled={disabled} onChange={onChange} />
        )}
        <PatternEditor
          cue={cue}
          defaultBpm={defaultBpm}
          sync={sync}
          playback={playback}
          disabled={disabled}
          onChange={onChange}
        />
        <Button variant="destructive" size="sm" onClick={onDelete}>
          블록 삭제
        </Button>
      </fieldset>
    </div>
  );
}
