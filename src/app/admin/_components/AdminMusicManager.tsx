"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ListMusic, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AdminMusic } from "@/types/catalog";
import { AdminAuthForm } from "./AdminAuthForm";
import { MusicSettingsForm } from "./MusicSettingsForm";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export function AdminMusicManager({
  initialMusics,
  readOnly,
}: {
  initialMusics: AdminMusic[];
  readOnly: boolean;
}) {
  const [musics, setMusics] = useState(initialMusics);
  const [selectedId, setSelectedId] = useState(initialMusics[0]?.id);
  const [query, setQuery] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const selected = musics.find((music) => music.id === selectedId);
  const visible = musics.filter((music) =>
    [music.title, music.korTitle, music.enTitle].some((title) =>
      title.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
    ),
  );
  function select(id: number) {
    if (saving || id === selectedId) return;
    if (
      dirty &&
      !window.confirm("저장하지 않은 변경사항을 버리고 다른 곡을 선택할까요?")
    )
      return;
    setDirty(false);
    setSelectedId(id);
  }
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link
              href="/"
              aria-label="공개 화면으로 돌아가기"
              title="공개 화면으로 돌아가기"
              onNavigate={(event) => {
                if (
                  saving ||
                  (dirty &&
                    !window.confirm(
                      "저장하지 않은 곡 설정을 버리고 공개 화면으로 이동할까요?",
                    ))
                )
                  event.preventDefault();
              }}
            >
              <ChevronLeft className="size-5" />
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6!" />
          <div>
            <p className="text-xs text-muted-foreground">loudasobi</p>
            <h1 className="text-sm font-semibold">곡 관리</h1>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {readOnly ? "열람 전용" : "관리자"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href="/admin/sidebar"
              onNavigate={(event) => {
                if (
                  saving ||
                  (dirty &&
                    !window.confirm(
                      "저장하지 않은 곡 설정을 버리고 추천 목록으로 이동할까요?",
                    ))
                )
                  event.preventDefault();
              }}
            >
              <ListMusic className="size-4" />
              추천 정렬
            </Link>
          </Button>
          <AdminAuthForm authenticated />
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <aside
          className="flex h-[30dvh] shrink-0 flex-col border-b bg-card md:h-auto md:w-72 md:border-r md:border-b-0 lg:w-80"
          aria-label="관리할 곡"
        >
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">곡 목록</h2>
              <span className="text-xs tabular-nums text-muted-foreground">
                {query ? `${visible.length} / ${musics.length}` : musics.length}
                곡
              </span>
            </div>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground"
              />
              <Input
                type="search"
                aria-label="곡 검색"
                placeholder="곡 제목 검색"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-9 bg-background pl-9"
              />
            </div>
          </div>
          <ScrollArea
            className="min-h-0 flex-1 px-2 pb-2"
            viewportProps={{
              role: "navigation",
              "aria-label": "관리할 곡 목록",
            }}
          >
            {visible.map((music) => (
              <button
                key={music.id}
                type="button"
                disabled={saving}
                onClick={() => select(music.id)}
                aria-current={selectedId === music.id ? "true" : undefined}
                className={cn(
                  "group mb-1 flex w-full cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                  selectedId === music.id && "border-border bg-accent",
                )}
              >
                <span className="min-w-0 flex-1 space-y-1.5">
                  <span
                    lang="ja"
                    className="block truncate text-sm font-medium"
                  >
                    {music.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {music.korTitle}
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge
                      variant={music.publish ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      {music.publish ? "공개" : "비공개"}
                    </Badge>
                    {!music.hasLyrics && (
                      <span className="text-[11px] text-muted-foreground">
                        가사 준비 중
                      </span>
                    )}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground/40",
                    selectedId === music.id && "text-foreground",
                  )}
                />
              </button>
            ))}
            {!visible.length && (
              <p className="p-4 text-sm text-muted-foreground">
                표시할 곡이 없습니다.
              </p>
            )}
          </ScrollArea>
        </aside>
        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted/30"
          role="region"
          aria-label="곡 설정"
        >
          {selected ? (
            <MusicSettingsForm
              key={selected.id}
              music={selected}
              readOnly={readOnly}
              onDirtyChange={setDirty}
              onBusyChange={setSaving}
              onSaved={(saved) =>
                setMusics((current) =>
                  current.map((music) =>
                    music.id === saved.id ? saved : music,
                  ),
                )
              }
            />
          ) : (
            <p className="p-8 text-sm text-muted-foreground">
              MONOASOBI에 곡을 추가하면 이곳에 자동으로 표시됩니다.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
