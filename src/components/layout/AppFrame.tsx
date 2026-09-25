"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "./Header";
import { Button } from "@/components/ui/button";
import { SongList } from "./SongList";
import { MusicExperience } from "@/components/player/MusicExperience";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { CatalogEntry } from "@/types/catalog";
import { useIsCompact } from "./AppFrame/useIsCompact";
import { sidebarMusicIds, type SidebarLayout } from "@/lib/sidebarOrder";

export function AppFrame({
  catalog,
  sidebarLayout,
  unavailable = false,
}: {
  catalog: CatalogEntry[];
  sidebarLayout: SidebarLayout;
  unavailable?: boolean;
}) {
  const t = useTranslations();
  const compact = useIsCompact();
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sort, setSort] = useState<"recommended" | "release">("recommended");
  const mainRef = useRef<HTMLElement>(null);
  const selected =
    catalog.find(
      (entry) =>
        entry.music.id === (selectedId ?? sidebarMusicIds(sidebarLayout)[0]),
    ) ?? catalog[0];

  function selectMusic(id: number) {
    setSelectedId(id);
    if (compact) setMobileOpen(false);
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only z-50 rounded bg-background p-3 focus:not-sr-only focus:absolute"
      >
        {t("skipLyrics")}
      </a>
      <Header
        onToggleSidebar={() =>
          compact
            ? setMobileOpen((open) => !open)
            : setDesktopOpen((open) => !open)
        }
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {!compact && (
          <aside
            className="w-[360px] shrink-0 overflow-hidden bg-muted/30 transition-[width] duration-(--motion-panel) ease-[ease] data-[open=false]:w-0 motion-reduce:transition-none"
            data-open={desktopOpen}
            inert={!desktopOpen}
            aria-hidden={!desktopOpen}
            aria-label={t("selectSong")}
          >
            <div className="h-full w-[360px] border-r">
              <SongList
                catalog={catalog}
                layout={sidebarLayout}
                sort={sort}
                onSort={setSort}
                selectedId={selected?.music.id}
                onSelect={selectMusic}
              />
            </div>
          </aside>
        )}
        <Sheet open={compact && mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="song-sheet gap-0 overflow-hidden p-0"
            closeLabel={t("close")}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              mainRef.current?.focus();
            }}
          >
            <SheetHeader className="h-14 shrink-0 justify-center border-b px-4 py-0">
              <SheetTitle className="text-sm">{t("songs")}</SheetTitle>
              <SheetDescription className="sr-only">
                {t("selectSongHelp")}
              </SheetDescription>
            </SheetHeader>
            <SongList
              catalog={catalog}
              layout={sidebarLayout}
              sort={sort}
              onSort={setSort}
              selectedId={selected?.music.id}
              onSelect={selectMusic}
            />
          </SheetContent>
        </Sheet>
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden outline-none"
        >
          {selected ? (
            <MusicExperience
              key={selected.music.id}
              music={selected.music}
              track={selected.track}
              sections={selected.sections}
            />
          ) : (
            <div
              className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground"
              role="status"
            >
              <p>{unavailable ? t("catalogError") : t("noSongs")}</p>
              {unavailable && (
                <Button
                  type="button"
                  onClick={() => window.location.reload()}
                  variant="link"
                >
                  {t("retry")}
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
