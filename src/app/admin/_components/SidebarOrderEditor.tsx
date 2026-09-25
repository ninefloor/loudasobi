"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  projectSidebar,
  moveSidebarGroup,
  moveSidebarSong,
  sidebarLayoutSchema,
  type SidebarLayout,
} from "@/lib/sidebarOrder";
import type { SidebarDocument } from "@/server/queries/sidebar";
import {
  SidebarGroupEditor,
  type SidebarDrag,
} from "./SidebarOrderEditor/SidebarGroupEditor";

export function SidebarOrderEditor({
  initial,
  readOnly,
}: {
  initial: SidebarDocument;
  readOnly: boolean;
}) {
  const [saved, setSaved] = useState(initial);
  const [layout, setLayout] = useState(initial.layout);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [drag, setDrag] = useState<SidebarDrag | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const dirty = JSON.stringify(layout) !== JSON.stringify(saved.layout);
  const disabled = readOnly || busy;
  const valid = sidebarLayoutSchema.safeParse(layout).success;
  const songs = new Map(saved.songs.map((song) => [song.id, song]));
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function update(next: SidebarLayout) {
    if (disabled) return;
    setLayout(next);
    setMessage("");
  }
  async function load() {
    if (
      busy ||
      (dirty && !window.confirm("초안을 버리고 최신 추천 목록을 불러올까요?"))
    )
      return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/sidebar", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setSaved(result.document);
      setLayout(result.document.layout);
      setMessage("최신 목록을 불러왔습니다.");
    } catch {
      setMessage("목록을 불러오지 못했습니다. 초안은 유지됩니다.");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (disabled || !valid) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/sidebar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision: saved.revision, layout }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setSaved(result.document);
      setLayout(result.document.layout);
      setMessage(
        "추천 목록을 저장했습니다. 공개 화면을 새로고침하면 반영됩니다.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "저장하지 못했습니다. 초안은 유지됩니다.",
      );
    } finally {
      setBusy(false);
    }
  }
  function dropSong(groupId: string | null, before?: number) {
    if (drag?.kind === "song")
      update(moveSidebarSong(layout, drag.id, groupId, before));
    setDrag(null);
    setOver(null);
  }
  function dropGroup(before?: string) {
    if (drag?.kind === "group")
      update(moveSidebarGroup(layout, drag.id, before));
    setDrag(null);
    setOver(null);
  }
  const visiblePreview = projectSidebar(
    layout,
    saved.songs.map((s) => s.id),
  );
  return (
    <main
      className="flex h-dvh flex-col overflow-hidden bg-background text-foreground"
      aria-busy={busy}
    >
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b px-5 py-3">
        <Button asChild variant="ghost" size="sm">
          <Link
            href="/admin"
            onNavigate={(event) => {
              if (
                busy ||
                (dirty &&
                  !window.confirm("저장하지 않은 목록을 버리고 나갈까요?"))
              )
                event.preventDefault();
            }}
          >
            ← 곡 관리
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">사이드바 · 추천 정렬</h1>
          <p className="text-xs text-muted-foreground">
            공개곡 {saved.songs.length}곡 · 그룹 {layout.groups.length}개
          </p>
        </div>
        <Badge variant="outline">
          {readOnly ? "열람 전용" : dirty ? "저장하지 않은 변경" : "저장됨"}
        </Badge>
        <Button size="sm" variant="outline" disabled={busy} onClick={load}>
          최신 목록
        </Button>
        <Button
          size="sm"
          disabled={disabled || !dirty || !valid}
          onClick={save}
        >
          {busy ? "처리 중…" : "추천 목록 저장"}
        </Button>
      </header>
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b px-5 py-3">
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled || layout.groups.length >= 100}
          onClick={() =>
            update({
              ...layout,
              groups: [
                ...layout.groups,
                { id: crypto.randomUUID(), name: "새 그룹", musicIds: [] },
              ],
            })
          }
        >
          + 그룹 추가
        </Button>
        <p className="flex-1 text-xs text-muted-foreground">
          손잡이를 드래그해 곡·그룹 순서를 바꾸세요. 그룹 간 이동도 가능합니다.
          터치·키보드는 이동 버튼과 그룹 선택을 사용하세요.
        </p>
        <Button
          size="xs"
          variant="ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                JSON.stringify(layout, null, 2),
              );
              setMessage("초안을 복사했습니다.");
            } catch {
              setMessage("클립보드 권한을 확인해 주세요.");
            }
          }}
        >
          초안 복사
        </Button>
      </div>
      {(message || !valid) && (
        <p role="status" className="shrink-0 border-b px-5 py-2 text-sm">
          {message || "그룹 이름은 1~80자로 입력해 주세요."}
        </p>
      )}
      <div className="flex min-h-0 flex-1">
        <ScrollArea className="min-h-0 min-w-0 flex-1">
          <div className="mx-auto max-w-3xl space-y-4 p-5">
            {!saved.songs.length && (
              <p className="rounded-lg border p-5 text-sm text-muted-foreground">
                공개된 곡이 없습니다. 곡 설정에서 공개하면 이곳에 자동으로
                나타납니다.
              </p>
            )}
            {[
              ...layout.groups,
              { id: null, name: "그룹 없음", musicIds: layout.ungrouped },
            ].map((group, index) => (
              <SidebarGroupEditor
                key={group.id ?? "ungrouped"}
                group={group}
                index={index}
                layout={layout}
                songs={songs}
                disabled={disabled}
                drag={drag}
                over={over}
                onDrag={setDrag}
                onOver={setOver}
                onDropSong={dropSong}
                onDropGroup={dropGroup}
                onChange={update}
              />
            ))}
          </div>
        </ScrollArea>
        <ScrollArea className="hidden w-72 shrink-0 border-l bg-muted/20 xl:block">
          <div className="space-y-4 p-5">
            <h2 className="text-sm font-semibold">추천순 미리보기</h2>
            <p className="text-xs text-muted-foreground">
              그룹 이름은 입력한 그대로 표시됩니다. 빈 그룹은 공개 화면에서
              숨깁니다.
            </p>
            {[
              ...visiblePreview.groups,
              {
                id: null,
                name: visiblePreview.groups.some((g) => g.musicIds.length)
                  ? "기타 곡"
                  : "",
                musicIds: visiblePreview.ungrouped,
              },
            ]
              .filter((g) => g.musicIds.length)
              .map((g) => (
                <section key={g.id ?? "ungrouped"} className="space-y-2">
                  {g.name && (
                    <h3 className="break-words text-sm font-semibold text-primary">
                      {g.name}
                    </h3>
                  )}
                  {g.musicIds.map((id) => (
                    <p
                      key={id}
                      className="truncate rounded border bg-card p-2 text-xs"
                    >
                      {songs.get(id)?.title}
                    </p>
                  ))}
                </section>
              ))}
          </div>
        </ScrollArea>
      </div>
    </main>
  );
}
