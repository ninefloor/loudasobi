"use client";

import ReactPlayer from "react-player";
import { type ReactNode } from "react";
import type { LyricTrack, CallSection } from "@/types/lyric";
import { GuidePreview } from "./GuidePreview";
import { PlayerBar } from "./PlayerBar";
import { usePlayback, type Playback } from "./MusicExperience/usePlayback";
import type { Music } from "@/types/music";

export function MusicExperience({
  music,
  track,
  sections,
  editor,
  editorOnly = false,
}: {
  music: Music;
  track?: LyricTrack;
  sections?: CallSection[];
  editor?: (playback: Playback) => ReactNode;
  editorOnly?: boolean;
}) {
  const { attachPlayer, ...playback } = usePlayback();
  const offset = track?.sync ?? 0;
  return (
    <>
      {music.youtubeId && (
        <div
          aria-hidden="true"
          inert
          className="pointer-events-none absolute size-px overflow-hidden opacity-0"
        >
          <ReactPlayer
            key={playback.playerKey}
            ref={attachPlayer}
            src={`https://www.youtube.com/watch?v=${music.youtubeId}`}
            width={320}
            height={180}
            volume={playback.volume}
            playsInline
            controls={false}
            config={{ youtube: { rel: 0 } }}
            {...playback.events}
          />
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        {editor?.(playback)}
        {!editorOnly && (
          <GuidePreview
            track={track}
            music={music}
            clock={playback.clock}
            ready={playback.ready}
            offset={offset}
            onSeek={playback.seek}
            sections={sections}
          />
        )}
      </div>
      <PlayerBar music={music} playback={playback} />
    </>
  );
}
