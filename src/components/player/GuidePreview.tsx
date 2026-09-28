"use client";

import { useCallback, useId, useMemo, useRef } from "react";
import { LocateFixed, Music2, Pause } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
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
      className="@container flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      aria-labelledby="song-title"
    >
      <header className="shrink-0 border-b bg-background px-4 py-2 sm:px-6">
        <div className="mx-auto grid max-w-[720px] grid-cols-[clamp(3.5rem,10cqi,4rem)_minmax(0,1fr)_clamp(3.5rem,10cqi,4rem)] items-center gap-x-2 gap-y-1.5">
          <FanLightBadge color={music.fanLightColor} />
          <div className="min-w-0 text-center">
            <h1
              id="song-title"
              className="text-[clamp(0.9375rem,0.8125rem+0.625cqi,1.125rem)] font-semibold leading-snug break-words"
              lang="ja"
            >
              {music.title}
            </h1>
            {locale !== "ja" && (
              <p
                lang={locale}
                className="mt-0.5 break-words text-[clamp(0.6875rem,0.625rem+0.3125cqi,0.75rem)] text-muted-foreground"
              >
                {locale === "ko" ? music.korTitle : music.enTitle}
              </p>
            )}
          </div>
          <span aria-hidden="true" />
          <div className="col-span-3 flex h-8 w-full items-center justify-between gap-2 border-t pt-1">
            <div className="flex items-center gap-2.5">
              <Label
                htmlFor={followId}
                className="cursor-pointer text-[clamp(0.6875rem,0.625rem+0.3125cqi,0.75rem)]"
              >
                {t("autoFollow")}
              </Label>
              <Switch
                id={followId}
                checked={follow.mode !== "off"}
                onCheckedChange={follow.toggle}
                className={
                  follow.mode === "paused"
                    ? "data-checked:bg-muted-foreground/30 opacity-70"
                    : undefined
                }
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
                  <Pause aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">{t("followPausedStatus")}</span>
                </span>
              )}
            </div>
            {follow.mode !== "following" && (
              <Button
                size="icon-sm"
                className="relative after:absolute after:-inset-1.5"
                aria-label={t("currentLyric")}
                title={t("currentLyric")}
                disabled={activeIndex < 0}
                onClick={follow.resume}
              >
                <LocateFixed aria-hidden="true" className="size-4" />
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
        <div className="mx-auto max-w-[720px] px-1 py-6 sm:px-6">
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
                    group.sections.length > 0 &&
                      "rounded-lg border bg-background",
                  )}
                >
                  {group.sections.length > 0 && (
                    <span
                      aria-hidden="true"
                      data-guide-pulse
                      className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0"
                    />
                  )}
                  {group.indices.map((index) => (
                    <LyricRow
                      key={display.rows[index].id ?? index}
                      line={display.rows[index]}
                      index={index}
                      locale={locale}
                      sections={sectionByLine[index]}
                      active={index === activeIndex}
                      badges={group.sections.filter((section) => {
                        const followsCurrent =
                          activeSectionIds.has(section.id) &&
                          (sectionByLine[activeIndex] ?? []).some(
                            (item) => item.id === section.id,
                          );
                        const anchor = followsCurrent
                          ? activeIndex
                          : group.indices.find((row) =>
                              sectionByLine[row].some(
                                (item) => item.id === section.id,
                              ),
                            );
                        return anchor === index;
                      })}
                      activeSectionIds={activeSectionIds}
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
