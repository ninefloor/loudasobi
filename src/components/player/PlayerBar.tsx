"use client";

import { LoaderCircle, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Music } from "@/types/music";
import type { Playback } from "./MusicExperience/usePlayback";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}

export function PlayerBar({
  music,
  playback: p,
}: {
  music: Music;
  playback: Playback;
}) {
  const t = useTranslations();
  const currentTime = useSyncExternalStore(
    p.clock.subscribeProgress,
    p.clock.getProgress,
    p.clock.getServerProgress,
  );
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  return (
    <footer
      aria-label={t("player")}
      className="shrink-0 border-t bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6"
    >
      {p.error && (
        <div className="mx-auto mb-3 flex max-w-[720px] items-center gap-3">
          <p role="alert" className="flex-1 text-xs text-destructive">
            {t(p.error)}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="min-h-10"
            onClick={() => {
              setScrubTime(null);
              p.retry();
            }}
          >
            {t("retryPlayback")}
          </Button>
        </div>
      )}
      <div className="mx-auto flex max-w-[720px] items-center gap-3">
        <Button
          disabled={!p.ready || p.error === "loadError"}
          size="icon"
          className="size-11"
          onClick={p.toggle}
          aria-label={p.playing ? t("pause") : t("play")}
        >
          {p.buffering ? (
            <LoaderCircle className="animate-spin motion-reduce:animate-none" />
          ) : p.playing ? (
            <Pause />
          ) : (
            <Play />
          )}
        </Button>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
            <span title={music.title} className="truncate font-medium">
              {music.title}
            </span>
            <span role="status" className="shrink-0 text-muted-foreground">
              {p.error
                ? t("playbackFailed")
                : !music.youtubeId
                  ? t("audioPending")
                  : !p.ready
                    ? t("connecting")
                    : p.buffering
                      ? t("buffering")
                      : p.playing
                        ? t("playing")
                        : currentTime > 0
                          ? t("paused")
                          : t("readyToPlay")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] tabular-nums">
              {formatTime(scrubTime ?? currentTime)}
            </span>
            <Slider
              disabled={!p.ready || p.duration <= 0}
              min={0}
              max={p.duration || 1}
              step={0.01}
              value={[Math.min(scrubTime ?? currentTime, p.duration || 1)]}
              onValueChange={([time]) => setScrubTime(time)}
              onValueCommit={([time]) => {
                p.seek(time);
                setScrubTime(null);
              }}
              aria-label={t("position")}
            />
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {formatTime(p.duration)}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          onClick={() => p.setVolume(p.volume > 0 ? 0 : 1)}
          aria-label={p.volume > 0 ? t("mute") : t("unmute")}
        >
          {p.volume > 0 ? <Volume2 /> : <VolumeX />}
        </Button>
        <Slider
          className="hidden w-20 sm:flex"
          min={0}
          max={1}
          step={0.01}
          value={[p.volume]}
          onValueChange={([volume]) => p.setVolume(volume)}
          aria-label={t("volume")}
        />
      </div>
    </footer>
  );
}
