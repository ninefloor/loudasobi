import type { Music } from "./music";
import type { LyricTrack, CallSection } from "./lyric";
export interface AdminMusic {
  id: number;
  title: string;
  korTitle: string;
  enTitle: string;
  youtubeId: string | null;
  fanLightColor: string | null;
  bpm: number | null;
  publish: boolean;
  syncOffset: number;
  sourceSync: number;
  hasLyrics: boolean;
}
export interface CatalogEntry {
  sections?: CallSection[];
  music: Music & { fanLightColor?: string };
  track?: LyricTrack;
}
