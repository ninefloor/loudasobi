import type { CallSection } from "@/types/lyric";

export const callLabels: Record<CallSection["type"], string> = {
  clap: "박수",
  chant: "챈트",
  singalong: "떼창",
};
export const callStyles: Record<CallSection["type"], string> = {
  clap: "border-yellow-600/60 bg-yellow-100/40 dark:border-yellow-400/50 dark:bg-yellow-900/20 [--guide-color:var(--yellow-600)] [--guide-active-bg:var(--yellow-100)] [--guide-active-text:var(--yellow-800)] dark:[--guide-color:var(--yellow-400)] dark:[--guide-active-bg:var(--yellow-900)] dark:[--guide-active-text:var(--yellow-200)]",
  chant:
    "border-cyan-500/60 bg-cyan-100/40 dark:border-cyan-400/50 dark:bg-cyan-900/20 [--guide-color:var(--cyan-500)] [--guide-active-bg:var(--cyan-100)] [--guide-active-text:var(--cyan-800)] dark:[--guide-color:var(--cyan-400)] dark:[--guide-active-bg:var(--cyan-900)] dark:[--guide-active-text:var(--cyan-200)]",
  singalong:
    "border-magenta-600/60 bg-magenta-100/40 dark:border-magenta-400/50 dark:bg-magenta-900/20 [--guide-color:var(--magenta-600)] [--guide-active-bg:var(--magenta-100)] [--guide-active-text:var(--magenta-800)] dark:[--guide-color:var(--magenta-400)] dark:[--guide-active-bg:var(--magenta-900)] dark:[--guide-active-text:var(--magenta-200)]",
};

export const callBadgeStyles: Record<CallSection["type"], string> = {
  clap: "border-yellow-600/25 bg-yellow-100/60 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200 data-[active=true]:border-yellow-700 data-[active=true]:bg-yellow-700 data-[active=true]:text-white dark:data-[active=true]:border-yellow-400 dark:data-[active=true]:bg-yellow-400 dark:data-[active=true]:text-yellow-950",
  chant:
    "border-cyan-600/25 bg-cyan-100/60 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-200 data-[active=true]:border-cyan-500 data-[active=true]:bg-cyan-500 data-[active=true]:text-cyan-900 dark:data-[active=true]:border-cyan-400 dark:data-[active=true]:bg-cyan-400 dark:data-[active=true]:text-cyan-900",
  singalong:
    "border-magenta-600/25 bg-magenta-100/60 text-magenta-900 dark:bg-magenta-900/30 dark:text-magenta-200 data-[active=true]:border-magenta-700 data-[active=true]:bg-magenta-700 data-[active=true]:text-white dark:data-[active=true]:border-magenta-400 dark:data-[active=true]:bg-magenta-400 dark:data-[active=true]:text-magenta-950",
};
