"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useLayoutEffect, useRef } from "react";
import type { CatalogEntry } from "@/types/catalog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SidebarLayout } from "@/lib/sidebarOrder";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

let savedScrollTop = 0;

export function SongList({
  catalog,
  layout,
  sort,
  onSort,
  selectedId,
  onSelect,
}: {
  catalog: CatalogEntry[];
  layout: SidebarLayout;
  sort: "recommended" | "release";
  onSort: (sort: "recommended" | "release") => void;
  selectedId?: number;
  onSelect: (id: number) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const entries = new Map(catalog.map((entry) => [entry.music.id, entry]));
  const items: (CatalogEntry | { group: string; name: string })[] =
    sort === "release"
      ? catalog
      : [
          ...layout.groups.flatMap((group) =>
            group.musicIds.length
              ? [
                  { group: group.id, name: group.name },
                  ...group.musicIds.flatMap((id) =>
                    entries.has(id) ? [entries.get(id)!] : [],
                  ),
                ]
              : [],
          ),
          ...(layout.groups.some((group) => group.musicIds.length) &&
          layout.ungrouped.length
            ? [{ group: "ungrouped", name: t("otherSongs") }]
            : []),
          ...layout.ungrouped.flatMap((id) =>
            entries.has(id) ? [entries.get(id)!] : [],
          ),
        ];
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = savedScrollTop;
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b p-3">
        <Select
          value={sort}
          onValueChange={(value) => {
            onSort(value as "recommended" | "release");
            savedScrollTop = 0;
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
          }}
        >
          <SelectTrigger className="w-full" aria-label={t("songSort")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="recommended">{t("recommendedSort")}</SelectItem>
            <SelectItem value="release">{t("releaseSort")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ScrollArea
        className="min-h-0 flex-1"
        viewportRef={scrollRef}
        viewportProps={{
          "aria-label": t("songs"),
          onScroll: (event) => {
            savedScrollTop = event.currentTarget.scrollTop;
          },
        }}
      >
        <nav aria-label={t("selectSong")} className="py-1">
          {items.map((item) => {
            if ("group" in item)
              return (
                <h2
                  key={`group:${item.group}`}
                  className="break-words border-b bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground"
                >
                  {item.name}
                </h2>
              );
            const { music, track } = item;
            const selected = selectedId === music.id;
            const isPending = !track?.lyric.length;
            return (
              <button
                key={music.id}
                type="button"
                aria-current={selected ? "true" : undefined}
                title={`${music.title} — ${music.korTitle} / ${music.enTitle}`}
                onClick={() => onSelect(music.id)}
                className={cn(
                  "grid w-full cursor-pointer grid-cols-[72px_minmax(0,1fr)] items-center gap-2.5 border-l-2 border-transparent px-4 py-2 text-left transition-colors duration-(--motion-fast) hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring max-[359px]:grid-cols-1",
                  selected &&
                    "border-l-primary bg-accent text-accent-foreground",
                  isPending && "text-muted-foreground",
                )}
              >
                <Image
                  src={`/images/albumart/${music.id}.webp`}
                  alt=""
                  width={72}
                  height={72}
                  className={cn(
                    "size-[72px] rounded-sm border object-cover max-[359px]:hidden",
                    isPending && "opacity-40 grayscale",
                  )}
                />
                <span
                  className={cn(
                    "flex min-w-0 flex-col gap-1",
                    isPending && "opacity-50",
                  )}
                >
                  <span lang="ja" className="truncate text-sm font-semibold">
                    {music.title}
                  </span>
                  {locale !== "ja" && (
                    <span
                      lang={locale}
                      className="truncate text-xs text-muted-foreground"
                    >
                      {locale === "ko" ? music.korTitle : music.enTitle}
                    </span>
                  )}
                  {isPending && (
                    <span>
                      <Badge variant="outline">{t("pending")}</Badge>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
