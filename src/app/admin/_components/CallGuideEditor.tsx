"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Redo2,
  Save,
  SlidersHorizontal,
  Undo2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { callLabels } from "@/components/player/GuidePreview/guideStyles";
import { EditorThemeMenu } from "./CallGuideEditor/EditorThemeMenu";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MusicExperience } from "@/components/player/MusicExperience";
import { resolveGuide, roundTime } from "@/lib/callGuide";
import type { GuideDocument } from "@/server/queries/guide";
import { useGuideHistory } from "./CallGuideEditor/useGuideHistory";
import { EditorWorkspace } from "./CallGuideEditor/EditorWorkspace";
import { NumberField } from "./CallGuideEditor/NumberField";
import { useEditorViewport } from "./CallGuideEditor/useEditorViewport";

export function CallGuideEditor({
  initial,
  readOnly,
}: {
  initial: GuideDocument;
  readOnly: boolean;
}) {
  const router = useRouter();
  const desktop = useEditorViewport();
  const [saved, setSaved] = useState(initial);
  const history = useGuideHistory({
    guide: initial.guide,
    syncOffset: initial.syncOffset,
  });
  const { guide, syncOffset } = history.draft;
  const [busy, setBusy] = useState(false);
  const [selectedCue, setSelectedCue] = useState<string | null>(null);
  const [loop, setLoop] = useState(false);
  function selectCue(id: string | null) {
    setSelectedCue(id);
    setLoop(false);
  }
  const [message, setMessage] = useState("");
  const dirty =
    JSON.stringify(guide) !== JSON.stringify(saved.guide) ||
    syncOffset !== saved.syncOffset;
  const track = useMemo(
    () => ({ ...saved.track, sync: saved.sourceSync + syncOffset }),
    [saved, syncOffset],
  );
  const resolved = useMemo(
    () => resolveGuide(guide, track.lyric),
    [guide, track.lyric],
  );
  const invalid =
    Object.keys(resolved.issues).length > 0 ||
    guide.cues.some((cue) => cue.start + track.sync < 0);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function save() {
    if (!desktop || readOnly || busy || invalid) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/musics/${saved.music.id}/guide`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revision: saved.revision, guide, syncOffset }),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "저장하지 못했습니다.");
      setSaved(result.document);
      setMessage(
        "콜과 가사 싱크를 저장했습니다. 공개 화면은 새로고침하면 반영됩니다.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "연결하지 못했습니다. 초안은 유지됩니다.",
      );
    } finally {
      setBusy(false);
    }
  }
  function leave() {
    if (
      !busy &&
      (!dirty || window.confirm("저장하지 않은 변경을 버리고 나갈까요?"))
    )
      router.push("/admin");
  }
  if (!desktop)
    return (
      <main className="flex h-dvh flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
        <h1 className="text-lg font-semibold">
          콜 편집은 넓은 화면에서 이용해 주세요
        </h1>
        <p className="text-sm text-muted-foreground">
          화면 너비 1024px 이상에서 편집할 수 있습니다. 창을 다시 넓히면 작성
          중인 초안이 유지됩니다.
        </p>
        <Button variant="outline" disabled={busy} onClick={leave}>
          곡 설정으로 돌아가기
        </Button>
      </main>
    );
  return (
    <main
      className="flex h-dvh flex-col overflow-hidden bg-background text-foreground"
      onKeyDown={(event) => {
        if (
          readOnly ||
          busy ||
          (event.target as HTMLElement).closest(
            "input, textarea, select, [contenteditable=true]",
          )
        )
          return;
        if (
          (event.metaKey || event.ctrlKey) &&
          event.key.toLowerCase() === "z"
        ) {
          event.preventDefault();
          if (event.shiftKey) history.redo();
          else history.undo();
        }
      }}
    >
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b bg-card px-4 py-3">
        <Button
          size="icon"
          variant="ghost"
          aria-label="곡 설정으로 돌아가기"
          title="곡 설정으로 돌아가기"
          disabled={busy}
          onClick={leave}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-base font-semibold">
              {saved.music.title}
            </h1>
            <Badge variant="outline">
              {saved.publish ? "공개 곡" : "비공개 곡"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            콜 편집 <span aria-hidden>·</span>{" "}
            {readOnly
              ? "열람 전용"
              : dirty
                ? "저장하지 않은 변경"
                : "모든 변경 저장됨"}
          </p>
        </div>
        <NativeSelect
          aria-label={`블록 선택 (${guide.cues.length})`}
          className="w-full sm:w-64"
          value={
            guide.cues.some((cue) => cue.id === selectedCue) ? selectedCue! : ""
          }
          onChange={(event) => selectCue(event.target.value || null)}
        >
          <NativeSelectOption value="">
            블록 선택 ({guide.cues.length})
          </NativeSelectOption>
          {guide.cues.map((item) => (
            <NativeSelectOption key={item.id} value={item.id}>
              {(item.start + track.sync).toFixed(2)}초 · {callLabels[item.type]}{" "}
              {resolved.issues[item.id] ? "⚠" : ""}{" "}
              {item.type === "chant"
                ? (item.labels?.ko ?? item.label)
                : item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <div className="flex items-center gap-1 border-r pr-3">
          <Button
            size="icon"
            variant="ghost"
            aria-label="실행 취소"
            title="실행 취소 · ⌘/Ctrl+Z"
            disabled={readOnly || busy || !history.canUndo}
            onClick={history.undo}
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="다시 실행"
            title="다시 실행 · ⌘/Ctrl+Shift+Z"
            disabled={readOnly || busy || !history.canRedo}
            onClick={history.redo}
          >
            <Redo2 className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="초안 복사"
            title="초안 복사"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  JSON.stringify({ guide, syncOffset }, null, 2),
                );
                setMessage("콜·싱크 초안을 복사했습니다.");
              } catch {
                setMessage("클립보드 권한을 확인해 주세요.");
              }
            }}
          >
            <Copy className="size-4" />
          </Button>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              <SlidersHorizontal className="size-4" />
              싱크 보정 {syncOffset >= 0 ? "+" : ""}
              {syncOffset.toFixed(2)}초
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 space-y-2 p-4"
            aria-label="전체 싱크 보정"
          >
            <h2 className="font-semibold">전체 싱크 보정</h2>
            <fieldset
              disabled={readOnly || busy}
              className="flex flex-wrap items-end gap-2"
            >
              <div className="w-44">
                <NumberField
                  label="가사 싱크 추가 보정 (초)"
                  value={syncOffset}
                  min={-3600}
                  max={3600}
                  onChange={(value) =>
                    history.update((draft) => ({ ...draft, syncOffset: value }))
                  }
                />
              </div>
              {[-0.1, -0.01, 0.01, 0.1].map((delta) => (
                <Button
                  key={delta}
                  size="xs"
                  variant="outline"
                  disabled={Math.abs(syncOffset + delta) > 3600}
                  onClick={() =>
                    history.update((draft) => ({
                      ...draft,
                      syncOffset: roundTime(draft.syncOffset + delta),
                    }))
                  }
                >
                  {delta > 0 ? "+" : ""}
                  {delta.toFixed(2)}
                </Button>
              ))}
              <span className="pb-1 text-xs text-muted-foreground">
                원본 {saved.sourceSync}초 + 보정 = {roundTime(track.sync)}초 ·
                가사와 콜 전체에 적용 / 개별 블록 위치 조절과 별개
              </span>
            </fieldset>
          </PopoverContent>
        </Popover>
        <EditorThemeMenu />
        <Button
          size="sm"
          disabled={readOnly || busy || !dirty || invalid}
          onClick={save}
        >
          <Save className="size-4" />
          {busy ? "저장 중…" : "전체 저장"}
        </Button>
      </header>
      {(message || invalid || !saved.music.youtubeId) && (
        <p role="status" className="shrink-0 border-b px-4 py-2 text-xs">
          {message ||
            (!saved.music.youtubeId
              ? "전용 YouTube ID가 없어 재생은 불가능합니다. 곡 설정에서 연결해 주세요."
              : "저장 전 재확인이 필요한 블록이 있습니다. 블록 설정에서 확인해 주세요.")}
        </p>
      )}
      <MusicExperience
        music={saved.music}
        track={track}
        sections={resolved.sections}
        editorOnly
        editor={(playback) => (
          <EditorWorkspace
            selected={selectedCue}
            onSelect={selectCue}
            loop={loop}
            onLoopChange={setLoop}
            music={saved.music}
            track={track}
            guide={guide}
            sections={resolved.sections}
            issues={resolved.issues}
            playback={playback}
            disabled={readOnly || busy}
            onChange={(next) =>
              history.update((draft) => ({ ...draft, guide: next }))
            }
          />
        )}
      />
    </main>
  );
}
