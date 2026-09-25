"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
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
        <p
          role="alert"
          className="mx-auto mb-2 max-w-5xl text-xs text-destructive"
        >
          {t(p.error)}
        </p>
      )}
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <Button
          disabled={!p.ready}
          size="icon"
          onClick={p.toggle}
          aria-label={p.playing ? t("pause") : t("play")}
        >
          {p.playing ? <Pause /> : <Play />}
        </Button>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
            <span title={music.title} className="truncate font-medium">
              {music.title}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {!music.youtubeId
                ? t("audioPending")
                : !p.ready
                  ? t("connecting")
                  : p.playing
                    ? t("playing")
                    : t("pause")}
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
