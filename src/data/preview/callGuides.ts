import type { CallSection, LyricTrack } from "@/types/lyric";

// Only reviewed call guides belong here. Imported lyrics alone do not imply availability.
export const callGuides: Record<number, CallSection[] | undefined> = {};

export function createDesignSample(track: LyricTrack): CallSection[] {
  if (track.lyric.length < 3) return [];
  return [
    {
      id: "design-chant",
      start: track.lyric[0].start,
      end: track.lyric[1].end,
      type: "chant",
      firstLine: 0,
      lastLine: 1,
      pulseTimes: [track.lyric[0].start, track.lyric[1].start],
    },
    {
      id: "design-clap",
      start: track.lyric[2].start,
      end: track.lyric[2].end,
      type: "clap",
      firstLine: 2,
      lastLine: 2,
      pulseTimes: [track.lyric[2].start, track.lyric[2].start + 0.5],
    },
  ];
}
