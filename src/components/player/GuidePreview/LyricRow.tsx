import { memo } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CallSection, LyricLine, LyricLocale } from "@/types/lyric";
import { callStyles } from "./guideStyles";
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
  const section = sections[0];
  function highlighted(field: LyricTextField) {
    const ranges = sections.flatMap(s => [
      ...(field === "jp" && s.selection?.line === index ? [s.selection] : []),
      ...(s.textSelections ?? []).filter(range => range.lineId === line.id && range.field === field),
    ]);
    return <HighlightedText text={line[field] ?? ""} ranges={ranges} />;
  }
  return (
    <div
      data-line-index={index}
      className={cn(
        "my-2 rounded-lg border border-transparent",
        section && callStyles[section.type],
      )}
    >
      {sections.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 px-4 pt-3">
          {sections.map((s) => (
            <Badge key={s.id} variant="outline" className="bg-background">
              {t(s.type)}
              {s.label ? ` · ${s.label}` : ""}
            </Badge>
          ))}
        </div>
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
          "block w-full rounded-[inherit] px-4 py-5 text-center transition-[background-color,color,box-shadow] duration-(--motion-lyric) enabled:cursor-pointer enabled:hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          active && "bg-accent/70 text-accent-foreground",
        )}
      >
        <span
          lang="ja"
          className="block text-base font-semibold leading-relaxed sm:text-lg"
        >
          {line.instrumental
            ? t("instrumental")
            : highlighted("jp")}
        </span>
        {!line.instrumental && locale === "ko" && (
          <>
            <span
              lang="ko"
              className="mt-1 block text-base font-medium leading-relaxed"
            >
              {highlighted("jpReading")}
            </span>
            <span
              lang="ko"
              className="mt-1 block text-sm leading-relaxed text-muted-foreground"
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
                className="mt-1 block text-base font-medium leading-relaxed"
              >
                {highlighted("enReading")}
              </span>
            )}
            {line.en && (
              <span
                lang="en"
                className="mt-1 block text-sm leading-relaxed text-muted-foreground"
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
