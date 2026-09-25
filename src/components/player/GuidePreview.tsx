"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Music2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createDesignSample } from "@/data/preview/callGuides";
import { fanLightHex, normalizeFanLightColor } from "@/lib/fanlights";
import type { Music } from "@/types/music";
import type {
  CallSection,
  LyricLine,
  LyricLocale,
  LyricTrack,
} from "@/types/lyric";
import { LyricRow } from "./GuidePreview/LyricRow";
import { SyncControls } from "./GuidePreview/SyncControls";
import { displayTimeline } from "./GuidePreview/displayTimeline";

import type { PlaybackClock } from "./MusicExperience/playbackClock";
import { useGuideTimeline } from "./GuidePreview/useGuideTimeline";
import { useLyricFollow } from "./GuidePreview/useLyricFollow";

const EMPTY_LINES: LyricLine[] = [];
const EMPTY_SECTIONS: CallSection[] = [];

export function GuidePreview({
  track,
  music,
  clock,
  ready,
  offset,
  onOffsetChange,
  onSeek,
  sections: savedSections = EMPTY_SECTIONS,
  editing = false,
}: {
  music: Music;
  track?: LyricTrack;
  clock: PlaybackClock;
  ready: boolean;
  offset: number;
  onOffsetChange: (value: number) => void;
  onSeek: (time: number, resume?: boolean) => void;
  sections?: CallSection[];
  editing?: boolean;
}) {
  const locale = useLocale() as LyricLocale;
  const t = useTranslations();
  const [sample, setSample] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sections = useMemo(
    () =>
      sample && track && process.env.NODE_ENV === "development"
        ? createDesignSample(track)
        : savedSections,
    [sample, track, savedSections],
  );
  const display = useMemo(
    () => displayTimeline(track?.lyric ?? EMPTY_LINES, sections),
    [track, sections],
  );
  const { activeIndex, sectionByLine } = useGuideTimeline(
    clock,
    display.rows,
    display.sections,
    offset,
    viewportRef,
  );
  const follow = useLyricFollow(activeIndex, viewportRef);
  const { center } = follow;
  const missingTranslation = track?.lyric.some((line) =>
    locale === "en"
      ? !line.en?.trim() || !line.enReading?.trim()
      : locale === "ko"
        ? !line.kr.trim() || !line.jpReading.trim()
        : false,
  );

  const jump = useCallback(
    (index: number) => {
      if (!display.rows[index]) return;
      onSeek(display.rows[index].start + offset, true);
      center(index);
    },
    [display.rows, offset, onSeek, center],
  );

  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-labelledby="song-title"
    >
      <div className="mx-auto mt-2 flex w-[95%] shrink-0 flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
        <div className="min-w-0">
          <h1
            id="song-title"
            title={`${music.title} / ${music.korTitle} / ${music.enTitle}`}
            className="truncate text-sm font-semibold"
          >
            <span lang="ja">{music.title}</span>{" "}
            {locale !== "ja" && (
              <span lang={locale} className="text-muted-foreground">
                {locale === "ko" ? music.korTitle : music.enTitle}
              </span>
            )}
          </h1>
        </div>
        <Badge variant="outline">
          {music.fanLightColor && (
            <span
              className="mr-1 size-3 rounded-full border"
              style={{ backgroundColor: fanLightHex(music.fanLightColor) }}
            />
          )}
          {normalizeFanLightColor(music.fanLightColor) ??
            music.fanLightColor ??
            t("fanlightUnset")}
        </Badge>
      </div>
      <div className="mx-auto flex w-[95%] shrink-0 flex-wrap items-center gap-2 py-2">
        <Button
          size="xs"
          variant={follow.mode === "off" ? "outline" : "secondary"}
          aria-pressed={follow.mode !== "off"}
          onClick={follow.toggle}
        >
          {t("follow", { state: follow.mode === "off" ? "OFF" : "ON" })}
        </Button>
        {follow.mode !== "following" && (
          <Button
            size="xs"
            variant="outline"
            disabled={activeIndex < 0}
            onClick={follow.resume}
          >
            {t("currentLyric")}
          </Button>
        )}
        {follow.mode === "paused" && (
          <span role="status" className="text-xs text-muted-foreground">
            {t("followPaused")}
          </span>
        )}
        {process.env.NODE_ENV === "development" && track && !editing && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="xs"
              variant={sample ? "secondary" : "outline"}
              aria-pressed={sample}
              onClick={() => setSample(!sample)}
            >
              {t("sample")}
            </Button>
            <SyncControls
              value={offset}
              initial={track.sync}
              onChange={onOffsetChange}
            />
          </div>
        )}
      </div>
      {sections.length > 0 && (
        <nav
          aria-label={t("jumpCalls")}
          className="mx-auto flex w-[95%] shrink-0 gap-1 overflow-x-auto pb-2"
        >
          {sections.map((section, index) => (
            <Button
              key={section.id}
              size="xs"
              variant="outline"
              disabled={!ready}
              onClick={() => onSeek(section.start + offset, true)}
            >
              {t(section.type)} {index + 1}
            </Button>
          ))}
        </nav>
      )}
      <ScrollArea
        {...follow.manualHandlers}
        className="min-h-0 flex-1"
        viewportRef={viewportRef}
        viewportProps={{
          "aria-label": t("allLyrics"),
          role: "region",
          tabIndex: 0,
        }}
      >
        <div className="mx-auto max-w-[720px] px-4 py-6 sm:px-6">
          <p
            className="mb-4 text-center text-xs text-muted-foreground"
            role="status"
          >
            {sample
              ? t("sampleNotice")
              : sections.length
                ? t("guideHelp")
                : t("guidePending")}
          </p>
          {missingTranslation && (
            <p className="mb-4 text-center text-xs text-muted-foreground">
              {t("translationPending")}
            </p>
          )}
          {display.rows.length ? (
            display.rows.map((line, index) => {
              return (
                <LyricRow
                  key={line.id ?? index}
                  line={line}
                  index={index}
                  locale={locale}
                  sections={sectionByLine[index]}
                  active={index === activeIndex}
                  ready={ready}
                  onSeek={jump}
                />
              );
            })
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Music2 className="size-8" aria-hidden />
              <p className="text-sm">{t("noLyrics")}</p>
              <p className="text-xs">{t("noLyricsHelp")}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}
