"use client";

import { useCallback, useId, useMemo, useRef } from "react";
import { Music2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FanLightBadge } from "@/components/common/FanLightBadge";
import type { Music } from "@/types/music";
import type {
  CallSection,
  LyricLine,
  LyricLocale,
  LyricTrack,
} from "@/types/lyric";
import { LyricRow } from "./GuidePreview/LyricRow";
import { groupLyrics } from "./GuidePreview/groupLyrics";
import { callBadgeStyles, callStyles } from "./GuidePreview/guideStyles";
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
  const followId = useId();
  const display = useMemo(
    () => displayTimeline(track?.lyric ?? EMPTY_LINES, sections),
    [track, sections],
  );
  const { activeIndex, activeSectionIds, sectionByLine } = useGuideTimeline(
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
              className="text-lg font-semibold leading-snug break-words"
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
          <FanLightBadge color={music.fanLightColor} />
          <div className="flex min-h-11 w-full flex-wrap items-center justify-between gap-2 border-t pt-2">
            <div className="flex min-h-10 flex-wrap items-center gap-3">
              <Label htmlFor={followId} className="cursor-pointer text-xs">
                {t("autoFollow")}
              </Label>
              <Switch
                id={followId}
                checked={follow.mode !== "off"}
                onCheckedChange={follow.toggle}
                aria-describedby={
                  follow.mode === "paused" ? `${followId}-status` : undefined
                }
              />
              {follow.mode === "paused" && (
                <span
                  id={`${followId}-status`}
                  role="status"
                  className="text-xs text-muted-foreground"
                >
                  {t("followPausedStatus")}
                </span>
              )}
            </div>
            {follow.mode !== "following" && (
              <Button
                size="sm"
                className="min-h-10"
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
        <div className="mx-auto max-w-[880px] px-14 py-6 sm:px-20">
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
          {display.rows.length ? (
            groups.map((group) => {
              const borderColors = [
                ...new Set(
                  group.sections
                    .filter((section) => activeSectionIds.has(section.id))
                    .map(
                      (section) =>
                        ({
                          clap: "var(--yellow-600)",
                          chant: "var(--cyan-500)",
                          singalong: "var(--magenta-500)",
                        })[section.type],
                    ),
                ),
              ];
              return (
                <div
                  key={display.rows[group.indices[0]].id ?? group.indices[0]}
                  data-call-block={group.sections.length > 0 ? "" : undefined}
                  style={
                    group.sections.length
                      ? {
                          borderColor: borderColors.length
                            ? borderColors.join(" ")
                            : "var(--border)",
                        }
                      : undefined
                  }
                  className={cn(
                    "relative isolate my-3 transition-[border-color] motion-reduce:transition-none",
                    group.sections.length > 0 && "rounded-lg border",
                    group.sections.length > 0 &&
                      callStyles[group.sections[0].type],
                  )}
                >
                  {group.sections.length > 0 && (
                    <span
                      aria-hidden="true"
                      data-guide-pulse
                      className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0"
                    />
                  )}
                  {group.sections.length > 0 && (
                    <div className="pointer-events-none absolute inset-y-0 -left-14 z-20 w-12 sm:-left-20 sm:w-16">
                      <div className="sticky top-1/2 flex -translate-y-1/2 flex-col items-center gap-2">
                        {group.sections.map((section) => (
                          <Badge
                            key={section.id}
                            variant="outline"
                            data-active={activeSectionIds.has(section.id)}
                            className={cn(
                              "h-auto min-h-6 max-w-full gap-1 px-1.5 py-1 text-center whitespace-normal break-words transition-colors motion-reduce:transition-none",
                              callBadgeStyles[section.type],
                            )}
                          >
                            {activeSectionIds.has(section.id) && (
                              <span
                                aria-hidden="true"
                                className="size-1.5 rounded-full bg-current"
                              />
                            )}
                            {section.type === "chant"
                              ? section.labels?.[locale] || section.label
                              : `${t(section.type)}${(section.labels?.[locale] ?? section.label) ? ` · ${section.labels?.[locale] ?? section.label}` : ""}`}
                          </Badge>
                        ))}
                      </div>
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
