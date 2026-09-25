import type { CallSection } from "@/types/lyric";

export const callLabels: Record<CallSection["type"], string> = {
  clap: "박수",
  chant: "콜",
  singalong: "떼창",
};
export const callStyles: Record<CallSection["type"], string> = {
  clap: "border-yellow-600/60 bg-yellow-100/40 dark:border-yellow-400/50 dark:bg-yellow-900/20",
  chant:
    "border-cyan-600/60 bg-cyan-100/40 dark:border-cyan-400/50 dark:bg-cyan-900/20",
  singalong:
    "border-magenta-600/60 bg-magenta-100/40 dark:border-magenta-400/50 dark:bg-magenta-900/20",
};
