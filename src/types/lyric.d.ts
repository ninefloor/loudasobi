export type LyricLocale = "ko" | "ja" | "en";
import type { LyricTextField } from "@/lib/lyricText";

export interface LyricLine {
  instrumental?: boolean;
  id?: string;
  start: number;
  end: number;
  jp: string;
  kr: string;
  jpReading: string;
  en?: string;
  enReading?: string;
}

export interface LyricTrack {
  id: number;
  sync: number;
  lyric: LyricLine[];
}

export interface CallSection {
  start: number;
  end: number;
  id: string;
  type: "clap" | "chant" | "singalong";
  firstLine: number;
  lastLine: number;
  label?: string;
  // Seconds on the lyric timeline; track sync is added when reading player time.
  pulseTimes: number[];
  // Optional selected text offsets, not pre-split lyric segments.
  selection?: { line: number; start: number; end: number };
  textSelections?: {lineId: string; field: LyricTextField; start: number; end: number}[];
}
