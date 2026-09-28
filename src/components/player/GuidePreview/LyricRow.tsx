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
  ready,
  onSeek,
}: {
  line: LyricLine;
  index: number;
  locale: LyricLocale;
  sections: CallSection[];
  active: boolean;
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
      {chants.length > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1 z-10 flex w-16 flex-col items-center justify-center gap-2 sm:left-2 sm:w-20"
        >
          {chants.map((section) => (
            <span
              key={section.id}
              data-chant-pulse={section.id}
              className="block max-w-full break-words text-center text-lg font-extrabold leading-tight text-cyan-600 dark:text-cyan-400 opacity-0 sm:text-xl"
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
          "block w-full px-4 py-4 sm:py-5 text-center transition-[background-color,color,box-shadow] duration-(--motion-lyric) enabled:cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          active
            ? "bg-[var(--guide-active-bg,var(--accent))] text-[color:var(--guide-active-text,var(--accent-foreground))] shadow-[inset_3px_0_0_var(--guide-color,var(--primary))]"
            : "enabled:hover:bg-muted/50",
        )}
      >
        <span
          lang="ja"
          className={cn(
            "block text-base leading-relaxed sm:text-lg",
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
                "mt-1.5 block text-base leading-relaxed sm:text-lg",
                active ? "font-semibold" : "font-medium",
              )}
            >
              {highlighted("jpReading")}
            </span>
            <span
              lang="ko"
              className={cn(
                "mt-2 block text-xs sm:text-sm leading-relaxed",
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
                  "mt-1.5 block text-base leading-relaxed sm:text-lg",
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
                  "mt-2 block text-xs sm:text-sm leading-relaxed",
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
