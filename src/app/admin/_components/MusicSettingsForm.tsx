"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  AudioLines,
  Globe,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  fanLightKeys,
  fanLightHex,
  normalizeFanLightColor,
} from "@/lib/fanlights";
import type { AdminMusic } from "@/types/catalog";

export function MusicSettingsForm({
  music,
  readOnly,
  onSaved,
  onDirtyChange,
  onBusyChange,
}: {
  music: AdminMusic;
  readOnly: boolean;
  onSaved: (music: AdminMusic) => void;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [youtubeId, setYoutubeId] = useState(music.youtubeId ?? "");
  const [fanLightColor, setFanLightColor] = useState(
    normalizeFanLightColor(music.fanLightColor) ?? music.fanLightColor ?? "",
  );
  const invalidColor =
    !!fanLightColor && !normalizeFanLightColor(fanLightColor);
  const [publish, setPublish] = useState(music.publish);
  const [bpm, setBpm] = useState(String(music.bpm ?? ""));
  const [syncOffset, setSyncOffset] = useState(String(music.syncOffset));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  function edited() {
    setMessage("");
    onDirtyChange(true);
    setDirty(true);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || readOnly || invalidColor) return;
    setBusy(true);
    onBusyChange(true);
    setMessage("");
    setFailed(false);
    try {
      const response = await fetch("/api/admin/musics/" + music.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeId: youtubeId.trim(),
          fanLightColor: fanLightColor || null,
          publish,
          bpm: bpm.trim() === "" ? null : Number(bpm),
          syncOffset: Number(syncOffset),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setFailed(true);
        setMessage(result.error ?? "저장하지 못했습니다.");
        return;
      }
      onSaved({ ...music, ...result.settings, id: music.id });
      setYoutubeId(result.settings.youtubeId ?? "");
      setSyncOffset(String(result.settings.syncOffset));
      setBpm(String(result.settings.bpm ?? ""));
      onDirtyChange(false);
      setDirty(false);
      setMessage(
        "저장했습니다. 공개 화면은 다시 열거나 새로고침하면 반영됩니다.",
      );
    } catch {
      setFailed(true);
      setMessage("서버에 연결하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }
  return (
    <form
      onSubmit={save}
      className="flex min-h-0 flex-1 flex-col"
      aria-busy={busy}
    >
      <ScrollArea
        className="min-h-0 flex-1"
        viewportProps={{
          tabIndex: 0,
          role: "region",
          "aria-label": "곡 설정 항목",
        }}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">곡 설정</span>
                <Badge variant={music.publish ? "secondary" : "outline"}>
                  {music.publish ? "공개 중" : "비공개"}
                </Badge>
              </div>
              <h2 lang="ja" className="text-2xl font-semibold tracking-tight">
                {music.title}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {music.korTitle} · {music.enTitle}
              </p>
            </div>
            <Button asChild variant="outline" className="bg-background">
              <Link
                href={`/admin/musics/${music.id}/guide`}
                onNavigate={(event) => {
                  if (
                    busy ||
                    (dirty &&
                      !window.confirm(
                        "저장하지 않은 곡 설정을 버리고 콜 편집으로 이동할까요?",
                      ))
                  )
                    event.preventDefault();
                }}
              >
                <AudioLines className="size-4" /> 콜 편집 · 미리보기{" "}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <fieldset disabled={readOnly || busy} className="grid min-w-0 gap-5">
            <section
              className="rounded-xl border bg-card p-5 sm:p-6"
              aria-labelledby="media-heading"
            >
              <div className="mb-5 flex items-start gap-3">
                <AudioLines
                  aria-hidden="true"
                  className="mt-0.5 size-5 text-muted-foreground"
                />
                <div>
                  <h3 id="media-heading" className="text-sm font-semibold">
                    음원 및 표시
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    재생할 음원과 곡의 킹블레이드 색상을 설정합니다.
                  </p>
                </div>
              </div>
              <div className="grid items-start gap-5 lg:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="youtube-id">loudasobi 전용 YouTube ID</Label>
                  <Input
                    id="youtube-id"
                    aria-describedby="youtube-help"
                    className="h-10"
                    value={youtubeId}
                    maxLength={11}
                    pattern="[A-Za-z0-9_-]{11}"
                    placeholder="11자리 영상 ID"
                    onChange={(event) => {
                      setYoutubeId(event.target.value);
                      edited();
                    }}
                  />
                  <span
                    id="youtube-help"
                    className="text-xs text-muted-foreground"
                  >
                    URL이 아닌 ID만 입력합니다. MONOASOBI의 MV ID와 별개입니다.
                  </span>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fanlight-color">킹블레이드 색상</Label>
                  <Select
                    disabled={readOnly || busy}
                    value={fanLightColor || "unset"}
                    onValueChange={(value) => {
                      setFanLightColor(value === "unset" ? "" : value);
                      edited();
                    }}
                  >
                    <SelectTrigger
                      id="fanlight-color"
                      className="w-full data-[size=default]:h-10"
                      aria-invalid={invalidColor}
                      aria-describedby={
                        invalidColor ? "fanlight-help" : undefined
                      }
                    >
                      <SelectValue placeholder="미지정" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectItem value="unset">미지정</SelectItem>
                        {invalidColor && (
                          <SelectItem value={fanLightColor} disabled>
                            기존 색상: {fanLightColor} (변경 필요)
                          </SelectItem>
                        )}
                        {fanLightKeys.map((key) => (
                          <SelectItem key={key} value={key} textValue={key}>
                            <span
                              aria-hidden="true"
                              className="size-4 shrink-0 rounded-full border border-black/25"
                              style={{ backgroundColor: fanLightHex(key) }}
                            />
                            {key}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {invalidColor && (
                    <p
                      id="fanlight-help"
                      className="text-xs text-muted-foreground"
                    >
                      기존 색상을 새 목록에서 다시 선택하거나 미지정으로 바꾼 후
                      저장해 주세요.
                    </p>
                  )}
                </div>
              </div>
            </section>
            <section
              className="rounded-xl border bg-card p-5 sm:p-6"
              aria-labelledby="timing-heading"
            >
              <div className="mb-5 flex items-start gap-3">
                <SlidersHorizontal
                  aria-hidden="true"
                  className="mt-0.5 size-5 text-muted-foreground"
                />
                <div>
                  <h3 id="timing-heading" className="text-sm font-semibold">
                    타이밍
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    콜 패턴의 기본 속도와 음원에 맞는 가사 싱크를 조정합니다.
                  </p>
                </div>
              </div>
              <div className="grid items-start gap-5 lg:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="music-bpm">곡 BPM</Label>
                  <Input
                    id="music-bpm"
                    type="number"
                    min={20}
                    max={400}
                    step="any"
                    value={bpm}
                    placeholder="미지정"
                    aria-describedby="bpm-help"
                    onChange={(event) => {
                      setBpm(event.target.value);
                      edited();
                    }}
                  />
                  <p id="bpm-help" className="text-xs text-muted-foreground">
                    새 펄스 패턴의 기본 BPM입니다. 미지정 시 120을 사용하며 기존
                    블록은 바뀌지 않습니다.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sync-offset">가사 싱크 보정 (초)</Label>
                  <Input
                    id="sync-offset"
                    type="number"
                    required
                    min={-3600}
                    max={3600}
                    step="0.01"
                    aria-describedby="sync-help"
                    value={syncOffset}
                    onChange={(event) => {
                      setSyncOffset(event.target.value);
                      edited();
                    }}
                  />
                  <p id="sync-help" className="text-xs text-muted-foreground">
                    MONOASOBI 기본값 {music.sourceSync}초 + 추가 보정값. 양수는
                    가사를 늦게, 음수는 일찍 표시합니다. 기본값 0은 추가 보정
                    없음입니다.
                  </p>
                </div>
              </div>
            </section>
            <section
              className="rounded-xl border bg-card p-5 sm:p-6"
              aria-labelledby="publish-heading"
            >
              <div className="mb-5 flex items-start gap-3">
                <Globe
                  aria-hidden="true"
                  className="mt-0.5 size-5 text-muted-foreground"
                />
                <div>
                  <h3 id="publish-heading" className="text-sm font-semibold">
                    공개 설정
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    저장하면 공개 곡 목록에 반영됩니다.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="music-publish"
                  disabled={readOnly || busy}
                  aria-describedby="publish-help"
                  checked={publish}
                  onCheckedChange={(checked) => {
                    setPublish(checked === true);
                    edited();
                  }}
                />
                <Label htmlFor="music-publish">
                  공개 (loudasobi 곡 목록에 표시)
                </Label>
              </div>
              <p
                id="publish-help"
                className="mt-3 text-xs leading-relaxed text-muted-foreground"
              >
                비공개로 전환해도 가사와 콜 자료는 보존됩니다. 공개하려면 전용
                YouTube ID가 필요합니다.
              </p>
            </section>
          </fieldset>
          <div className="space-y-3 px-1 text-xs leading-relaxed text-muted-foreground">
            <Separator />
            <p>
              {music.hasLyrics ? "MONOASOBI 가사 연결됨" : "가사 준비 중"} ·
              제목과 가사는 MONOASOBI에서 수정합니다.
              <br />콜 편집과 미리보기에는 저장된 설정이 적용됩니다.
            </p>
          </div>
        </div>
      </ScrollArea>
      <footer className="shrink-0 border-t bg-card px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div
            className="min-w-0 flex-1 text-xs text-muted-foreground"
            aria-live="polite"
          >
            {message ? (
              <p
                role={failed ? "alert" : "status"}
                className={failed ? "text-destructive" : ""}
              >
                {message}
              </p>
            ) : readOnly ? (
              "열람 전용 계정입니다."
            ) : dirty ? (
              "저장하지 않은 변경사항이 있습니다."
            ) : (
              "변경사항을 저장하면 설정이 반영됩니다."
            )}
          </div>
          <Button type="submit" disabled={readOnly || busy || invalidColor}>
            <Save className="size-4" />
            {busy ? "저장 중…" : "설정 저장"}
          </Button>
        </div>
      </footer>
    </form>
  );
}
