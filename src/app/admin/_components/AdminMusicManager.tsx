"use client";
import { useState } from "react";
import Link from "next/link";
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
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <div>
          <h1 className="font-semibold">loudasobi 곡 관리</h1>
          <p className="text-xs text-muted-foreground">
            {readOnly ? "열람 전용" : "관리자"} · {musics.length}곡
          </p>
        </div>
        <div className="flex items-center gap-4">
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
              사이드바 · 추천 정렬
            </Link>
          </Button>
          <Link href="/" className="text-sm text-primary">
            공개 화면
          </Link>
          <AdminAuthForm authenticated />
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <aside
          className="flex h-[35dvh] shrink-0 flex-col border-b md:h-auto md:w-80 md:border-r md:border-b-0"
          aria-label="관리할 곡"
        >
          <div className="p-3">
            <Input
              type="search"
              aria-label="곡 검색"
              placeholder="곡 제목 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-9"
            />
          </div>
          <ScrollArea
            className="min-h-0 flex-1"
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
                  "flex w-full cursor-pointer flex-col gap-1 border-l-2 border-transparent px-4 py-3 text-left hover:bg-accent",
                  selectedId === music.id && "border-l-primary bg-accent",
                )}
              >
                <span lang="ja" className="text-sm font-medium">
                  {music.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {music.korTitle}
                </span>
                <span className="text-xs text-muted-foreground">
                  {music.publish ? "공개" : "비공개"} ·{" "}
                  {music.hasLyrics ? "가사 연결" : "가사 준비 중"}
                </span>
              </button>
            ))}
            {!visible.length && (
              <p className="p-4 text-sm text-muted-foreground">
                표시할 곡이 없습니다.
              </p>
            )}
          </ScrollArea>
        </aside>
        <ScrollArea
          className="min-h-0 min-w-0 flex-1"
          viewportProps={{
            role: "region",
            "aria-label": "곡 설정",
            tabIndex: 0,
          }}
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
        </ScrollArea>
      </div>
    </main>
  );
}
