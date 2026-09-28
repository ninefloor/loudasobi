import { Badge } from "@/components/ui/badge";
import { callBadgeStyles } from "./guideStyles";
import { memo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { CallSection, LyricLine, LyricLocale } from "@/types/lyric";
import { HighlightedText } from "../HighlightedText";
import type { LyricTextField } from "@/lib/lyricText";

export const LyricRow = memo(function LyricRow({
  line,
  index,
  locale,
  sections,
  active,
  badges,
  activeSectionIds,
  ready,
  onSeek,
}: {
  line: LyricLine;
  index: number;
  locale: LyricLocale;
  sections: CallSection[];
  active: boolean;
  badges: CallSection[];
  activeSectionIds: Set<string>;
  ready: boolean;
  onSeek: (index: number) => void;
}) {
  const t = useTranslations();
  const chants = sections.filter((section) => section.type === "chant");
  function highlighted(field: LyricTextField) {
    const ranges = sections.flatMap((s) => [
      ...(field === "jp" && s.selection?.line === index ? [s.selection] : []),
      ...(s.textSelections ?? []).filter(
        (range) => range.lineId === line.id && range.field === field,
      ),
    ]);
    return <HighlightedText text={line[field] ?? ""} ranges={ranges} />;
  }
  return (
    <div data-line-index={index} className="relative">
      {badges.length > 0 && (
        <div className="pointer-events-none absolute left-2 top-1/2 z-20 flex w-max min-w-12 max-w-[clamp(3rem,12cqi,4rem)] -translate-y-1/2 flex-col items-start gap-2 sm:left-3">
          {badges.map((section) => (
            <Badge
              key={section.id}
              variant="outline"
              data-active={activeSectionIds.has(section.id)}
              className={cn(
                "h-6 min-w-12 max-w-full gap-1 whitespace-nowrap px-1.5 py-1 text-[clamp(0.625rem,0.5625rem+0.3125cqi,0.75rem)] transition-colors motion-reduce:transition-none",
                callBadgeStyles[section.type],
              )}
            >
              {activeSectionIds.has(section.id) && (
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full bg-current"
                />
              )}
              <span className="min-w-0 truncate">
                {section.type === "chant"
                  ? section.labels?.[locale] || section.label
                  : `${t(section.type)}${(section.labels?.[locale] ?? section.label) ? ` · ${section.labels?.[locale] ?? section.label}` : ""}`}
              </span>
            </Badge>
          ))}
        </div>
      )}
      {chants.length > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-1 z-10 flex w-[clamp(3rem,12cqi,4rem)] flex-col items-center justify-center gap-2 sm:right-2"
        >
          {chants.map((section) => (
            <span
              key={section.id}
              data-chant-pulse={section.id}
              className="block max-w-full break-words text-center text-[clamp(0.875rem,0.75rem+0.625cqi,1.25rem)] font-extrabold leading-tight text-cyan-600 dark:text-cyan-400 opacity-0"
            >
              {section.labels?.[locale] || section.label}
            </span>
          ))}
        </span>
      )}
      <button
        type="button"
        disabled={!ready}
        onClick={() => onSeek(index)}
        aria-current={active ? "true" : undefined}
        aria-label={t("seekLyric", {
          lyric: line.instrumental ? t("instrumental") : line.jp,
        })}
        className={cn(
          "block w-full px-[clamp(0.5rem,2.5cqi,1.5rem)] py-[clamp(0.875rem,3cqi,1.25rem)] [overflow-wrap:anywhere] text-center transition-[background-color,color,box-shadow] duration-(--motion-lyric) enabled:cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          sections.length > 0 && "px-[clamp(4rem,12cqi,5rem)]",
          active
            ? "bg-black/[0.04] text-foreground shadow-[inset_3px_0_0_rgb(0_0_0/0.18)] dark:bg-white/[0.07] dark:shadow-[inset_3px_0_0_rgb(255_255_255/0.25)]"
            : "enabled:hover:bg-muted/50",
        )}
      >
        <span
          lang="ja"
          className={cn(
            "block text-[clamp(0.875rem,0.75rem+0.625cqi,1.125rem)] tracking-[clamp(-0.02em,-0.04em+0.1cqi,0em)] leading-relaxed",
            active ? "font-bold" : "font-medium",
          )}
        >
          {line.instrumental ? t("instrumental") : highlighted("jp")}
        </span>
        {!line.instrumental && locale === "ko" && (
          <>
            <span
              lang="ko"
              className={cn(
                "mt-1.5 block text-[clamp(0.875rem,0.75rem+0.625cqi,1.125rem)] tracking-[clamp(-0.02em,-0.04em+0.1cqi,0em)] leading-relaxed",
                active ? "font-semibold" : "font-medium",
              )}
            >
              {highlighted("jpReading")}
            </span>
            <span
              lang="ko"
              className={cn(
                "mt-2 block text-[clamp(0.6875rem,0.625rem+0.3125cqi,0.875rem)] tracking-[clamp(-0.01em,-0.04em+0.1cqi,0em)] leading-relaxed",
                active ? "text-inherit opacity-80" : "text-muted-foreground",
              )}
            >
              {highlighted("kr")}
            </span>
          </>
        )}
        {!line.instrumental && locale === "en" && (
          <>
            {line.enReading && (
              <span
                lang="en"
                className={cn(
                  "mt-1.5 block text-[clamp(0.875rem,0.75rem+0.625cqi,1.125rem)] tracking-[clamp(-0.02em,-0.04em+0.1cqi,0em)] leading-relaxed",
                  active ? "font-semibold" : "font-medium",
                )}
              >
                {highlighted("enReading")}
              </span>
            )}
            {line.en && (
              <span
                lang="en"
                className={cn(
                  "mt-2 block text-[clamp(0.6875rem,0.625rem+0.3125cqi,0.875rem)] tracking-[clamp(-0.01em,-0.04em+0.1cqi,0em)] leading-relaxed",
                  active ? "text-inherit opacity-80" : "text-muted-foreground",
                )}
              >
                {highlighted("en")}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
});
