"use client";

import { useCallback, useMemo, useRef } from "react";
import { Music2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fanLightHex, normalizeFanLightColor } from "@/lib/fanlights";
import type { Music } from "@/types/music";
import type {
  CallSection,
  LyricLine,
  LyricLocale,
  LyricTrack,
} from "@/types/lyric";
import { LyricRow } from "./GuidePreview/LyricRow";
import { groupLyrics } from "./GuidePreview/groupLyrics";
import { callStyles } from "./GuidePreview/guideStyles";
import { cn } from "@/lib/utils";
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
  onSeek,
  sections = EMPTY_SECTIONS,
}: {
  music: Music;
  track?: LyricTrack;
  clock: PlaybackClock;
  ready: boolean;
  offset: number;
  onSeek: (time: number, resume?: boolean) => void;
  sections?: CallSection[];
}) {
  const locale = useLocale() as LyricLocale;
  const t = useTranslations();
  const viewportRef = useRef<HTMLDivElement>(null);
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
  const groups = useMemo(() => groupLyrics(sectionByLine), [sectionByLine]);
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
      <header className="shrink-0 border-b bg-background px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[720px] flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1 basis-40">
            <h1
              id="song-title"
              className="text-base font-semibold leading-snug break-words"
              lang="ja"
            >
              {music.title}
            </h1>
            {locale !== "ja" && (
              <p lang={locale} className="mt-0.5 text-xs text-muted-foreground">
                {locale === "ko" ? music.korTitle : music.enTitle}
              </p>
            )}
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
          <div className="flex w-full flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="min-h-10"
              variant={follow.mode === "following" ? "secondary" : "outline"}
              aria-pressed={follow.mode !== "off"}
              onClick={follow.toggle}
            >
              {t(
                follow.mode === "following"
                  ? "followFollowing"
                  : follow.mode === "paused"
                    ? "followPaused"
                    : "followOff",
              )}
            </Button>
            {follow.mode !== "following" && (
              <Button
                size="sm"
                className="min-h-10"
                variant="outline"
                disabled={activeIndex < 0}
                onClick={follow.resume}
              >
                {t("currentLyric")}
              </Button>
            )}
          </div>
        </div>
      </header>
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
            {sections.length ? t("guideHelp") : t("guidePending")}
          </p>
          {missingTranslation && (
            <p className="mb-4 text-center text-xs text-muted-foreground">
              {t("translationPending")}
            </p>
          )}
          {sections.length > 0 && (
            <details className="mb-5 rounded-lg border bg-card">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">
                {t("jumpCalls")}
              </summary>
              <nav
                aria-label={t("jumpCalls")}
                className="flex flex-wrap gap-2 px-3 pb-3"
              >
                {sections.map((section, index) => (
                  <Button
                    key={section.id}
                    size="sm"
                    className="min-h-10"
                    variant="outline"
                    disabled={!ready}
                    onClick={() => onSeek(section.start + offset, true)}
                  >
                    {t(section.type)} {index + 1}
                  </Button>
                ))}
              </nav>
            </details>
          )}
          {display.rows.length ? (
            groups.map((group) => (
              <div
                key={display.rows[group.indices[0]].id ?? group.indices[0]}
                data-call-block={group.sections.length > 0 ? "" : undefined}
                className={cn(
                  "relative isolate my-3 overflow-hidden",
                  group.sections.length > 0 && "rounded-lg border",
                  group.sections.length > 0 &&
                    callStyles[group.sections[0].type],
                )}
              >
                {group.sections.length > 0 && (
                  <span
                    aria-hidden="true"
                    data-guide-pulse
                    className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
                  />
                )}
                {group.sections.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 border-b border-current/10 px-4 py-3">
                    {group.sections.map((section) => (
                      <Badge
                        key={section.id}
                        variant="outline"
                        className="bg-background"
                      >
                        {t(section.type)}
                        {section.label ? ` · ${section.label}` : ""}
                      </Badge>
                    ))}
                  </div>
                )}
                {group.indices.map((index) => (
                  <LyricRow
                    key={display.rows[index].id ?? index}
                    line={display.rows[index]}
                    index={index}
                    locale={locale}
                    sections={sectionByLine[index]}
                    active={index === activeIndex}
                    ready={ready}
                    onSeek={jump}
                  />
                ))}
              </div>
            ))
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
