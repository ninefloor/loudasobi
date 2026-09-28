"use client";
import { useEffect, useRef, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { messages } from "@/i18n/messages";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { GuidePreview } from "@/components/player/GuidePreview";
import { callLabels } from "@/components/player/GuidePreview/guideStyles";
import type { Playback } from "@/components/player/MusicExperience/usePlayback";
import type { LyricTrack, CallSection } from "@/types/lyric";
import type { Music } from "@/types/music";
import {
  roundTime,
  defaultPulsePattern,
  snapshotLine,
  type CallCue,
  type CallGuide,
} from "@/lib/callGuide";
import { VerticalTimeline } from "./VerticalTimeline";
import { CueInspector } from "./CueInspector";
import { useEditorShortcuts } from "./useEditorShortcuts";

export function EditorWorkspace({
  music,
  track,
  guide,
  sections,
  issues,
  playback,
  disabled,
  onChange,
}: {
  music: Music;
  track: LyricTrack;
  guide: CallGuide;
  sections: CallSection[];
  issues: Record<string, string>;
  playback: Playback;
  disabled: boolean;
  onChange: (guide: CallGuide) => void;
}) {
  useEditorShortcuts(playback);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [preview, setPreview] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<Locale>("ko");
  const [loop, setLoop] = useState(false);
  const loopSeeking = useRef(false);
  const cue = guide.cues.find((item) => item.id === selected);
  const newDuration = 480 / (music.bpm ?? 120);
  const { clock, seek } = playback;
  useEffect(() => {
    if (!loop || !cue) return;
    return clock.subscribeFrame((sample) => {
      if (sample.reset) {
        loopSeeking.current = false;
        return;
      }
      if (!sample.running || loopSeeking.current) return;
      const start = Math.max(0, cue.start + track.sync - 1),
        end = cue.end + track.sync;
      if (sample.time >= end || sample.time < start) {
        loopSeeking.current = true;
        seek(start, true);
      }
    });
  }, [loop, cue, clock, seek, track.sync]);
  function update(next: CallCue) {
    if (!disabled)
      onChange({
        version: 2,
        cues: guide.cues.map((item) => (item.id === next.id ? next : item)),
      });
  }
  function create(start: number, end: number, fromLyrics = false) {
    if (disabled || guide.cues.length >= 500) return;
    const next: CallCue = {
      id: crypto.randomUUID(),
      type: "clap",
      label: "",
      start: roundTime(start),
      end: roundTime(end),
      lines: fromLyrics
        ? selectedLines
            .map((index) => track.lyric[index])
            .filter((line) => line.id)
            .map(snapshotLine)
        : [],
      pulseTimes: [],
      pattern: defaultPulsePattern(music.bpm),
    };
    onChange({ version: 2, cues: [...guide.cues, next] });
    setSelected(next.id);
    setLoop(false);
  }
  function select(id: string) {
    setSelected(id);
    setLoop(false);
  }
  const selectedSource = selectedLines.map((index) => track.lyric[index]);
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2">
        <Button
          size="xs"
          variant={!preview ? "secondary" : "outline"}
          aria-pressed={!preview}
          onClick={() => setPreview(false)}
        >
          세로 타임라인
        </Button>
        <Button
          size="xs"
          variant={preview ? "secondary" : "outline"}
          aria-pressed={preview}
          onClick={() => setPreview(true)}
        >
          감상 미리보기
        </Button>
        {preview && (
          <NativeSelect
            aria-label="미리보기 언어"
            value={previewLocale}
            onChange={(event) => setPreviewLocale(event.target.value as Locale)}
          >
            {locales.map((locale) => (
              <NativeSelectOption key={locale} value={locale}>
                {localeNames[locale]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}
        <Button
          size="xs"
          variant="outline"
          disabled={
            disabled || !selectedLines.length || guide.cues.length >= 500
          }
          onClick={() =>
            create(selectedSource[0].start, selectedSource.at(-1)!.end, true)
          }
        >
          선택 가사로 콜 추가 ({selectedLines.length})
        </Button>
        <Button
          size="xs"
          variant="outline"
          disabled={disabled || !cue || !selectedLines.length}
          onClick={() =>
            cue &&
            update({
              ...cue,
              lines: selectedSource.filter((line) => line.id).map(snapshotLine),
              selection: undefined,
              textSelections: undefined,
            })
          }
        >
          선택 블록에 가사 연결
        </Button>
        <Button
          size="xs"
          variant="outline"
          disabled={
            disabled ||
            guide.cues.length >= 500 ||
            (playback.duration > 0 &&
              playback.clock.read().time >= playback.duration - 0.01)
          }
          onClick={() => {
            const start = roundTime(playback.clock.read().time - track.sync);
            create(
              start,
              roundTime(
                Math.min(
                  start + newDuration,
                  playback.duration > 0
                    ? playback.duration - track.sync
                    : start + newDuration,
                ),
              ),
            );
          }}
        >
          현재 위치에 콜 추가
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {preview ? (
          <NextIntlClientProvider
            locale={previewLocale}
            messages={messages[previewLocale]}
            timeZone="Asia/Seoul"
          >
            <GuidePreview
              music={music}
              track={track}
              sections={sections}
              clock={clock}
              ready={playback.ready}
              offset={track.sync}
              onSeek={seek}
            />
          </NextIntlClientProvider>
        ) : (
          <VerticalTimeline
            lines={track.lyric}
            cues={guide.cues}
            sync={track.sync}
            playback={playback}
            selectedId={selected}
            selectedLines={selectedLines}
            disabled={disabled}
            onSelect={select}
            onLines={setSelectedLines}
            onCreate={create}
            onChange={update}
          />
        )}
        <ScrollArea className="h-[38%] min-h-0 shrink-0 border-t lg:h-auto lg:w-[360px] lg:border-t-0 lg:border-l">
          <div className="space-y-2 border-b p-3">
            <Label htmlFor="selected-cue">
              블록 선택 ({guide.cues.length})
            </Label>
            <NativeSelect
              id="selected-cue"
              value={cue?.id ?? ""}
              className="w-full"
              onChange={(event) => select(event.target.value)}
            >
              <NativeSelectOption value="">
                블록을 선택하세요
              </NativeSelectOption>
              {guide.cues.map((item) => (
                <NativeSelectOption key={item.id} value={item.id}>
                  {(item.start + track.sync).toFixed(2)}초 ·{" "}
                  {callLabels[item.type]} {issues[item.id] ? "⚠" : ""}{" "}
                  {item.type === "chant"
                    ? (item.labels?.ko ?? item.label)
                    : item.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          {cue ? (
            <CueInspector
              cue={cue}
              lines={track.lyric}
              defaultBpm={music.bpm}
              sync={track.sync}
              playback={playback}
              disabled={disabled}
              issue={
                issues[cue.id] ||
                (cue.start + track.sync < 0
                  ? "블록이 재생 시작 이전에 있습니다. 위치를 조정해 주세요."
                  : undefined)
              }
              onChange={update}
              onDelete={() => {
                if (disabled) return;
                onChange({
                  version: 2,
                  cues: guide.cues.filter((item) => item.id !== cue.id),
                });
                setSelected(null);
                setLoop(false);
              }}
              loop={loop}
              onLoop={() => {
                setLoop(!loop);
                if (!loop)
                  playback.seek(Math.max(0, cue.start + track.sync - 1), true);
              }}
            />
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              왼쪽 가사를 선택하거나 오른쪽 빈 시간 구간을 드래그해 콜 블록을
              만드세요. 오른쪽에서 종류를 바꾸고 박자 패턴과 ±0.01초 위치 조절을
              설정할 수 있습니다.
            </p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
