import type { CallSection } from "@/types/lyric";

export const callLabels: Record<CallSection["type"], string> = {
  clap: "박수",
  chant: "콜",
  singalong: "떼창",
};
export const callStyles: Record<CallSection["type"], string> = {
  clap: "border-yellow-600/60 bg-yellow-100/40 dark:border-yellow-400/50 dark:bg-yellow-900/20 [--guide-color:var(--yellow-600)] [--guide-active-bg:var(--yellow-100)] [--guide-active-text:var(--yellow-800)] dark:[--guide-color:var(--yellow-400)] dark:[--guide-active-bg:var(--yellow-900)] dark:[--guide-active-text:var(--yellow-200)]",
  chant:
    "border-cyan-600/60 bg-cyan-100/40 dark:border-cyan-400/50 dark:bg-cyan-900/20 [--guide-color:var(--cyan-600)] [--guide-active-bg:var(--cyan-100)] [--guide-active-text:var(--cyan-800)] dark:[--guide-color:var(--cyan-400)] dark:[--guide-active-bg:var(--cyan-900)] dark:[--guide-active-text:var(--cyan-200)]",
  singalong:
    "border-magenta-600/60 bg-magenta-100/40 dark:border-magenta-400/50 dark:bg-magenta-900/20 [--guide-color:var(--magenta-600)] [--guide-active-bg:var(--magenta-100)] [--guide-active-text:var(--magenta-800)] dark:[--guide-color:var(--magenta-400)] dark:[--guide-active-bg:var(--magenta-900)] dark:[--guide-active-text:var(--magenta-200)]",
};
