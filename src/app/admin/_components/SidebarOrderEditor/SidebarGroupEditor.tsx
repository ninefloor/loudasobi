"use client";
import { GripVertical, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import {
  moveSidebarSong,
  moveSidebarGroup,
  type SidebarLayout,
} from "@/lib/sidebarOrder";
import type { SidebarDocument } from "@/server/queries/sidebar";

export type SidebarDrag =
  { kind: "song"; id: number } | { kind: "group"; id: string };
export function SidebarGroupEditor({
  group,
  index,
  layout,
  songs,
  disabled,
  drag,
  over,
  onDrag,
  onOver,
  onDropSong,
  onDropGroup,
  onChange,
}: {
  group: {
    id: string | null;
    name: SidebarLayout["groups"][number]["name"];
    musicIds: number[];
  };
  index: number;
  layout: SidebarLayout;
  songs: Map<number, SidebarDocument["songs"][number]>;
  disabled: boolean;
  drag: SidebarDrag | null;
  over: string | null;
  onDrag: (value: SidebarDrag | null) => void;
  onOver: (key: string | null) => void;
  onDropSong: (groupId: string | null, before?: number) => void;
  onDropGroup: (before?: string) => void;
  onChange: (next: SidebarLayout) => void;
}) {
  const key = group.id ?? "ungrouped";
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 border-b bg-muted/40 p-3",
          over === `group:${key}` && "ring-2 ring-inset ring-primary",
        )}
        onDragOver={(event) => {
          if (!disabled && drag?.kind === "group") {
            event.preventDefault();
            onOver(`group:${key}`);
          }
        }}
        onDrop={(event) => {
          if (!disabled && drag?.kind === "group") {
            event.preventDefault();
            onDropGroup(group.id ?? undefined);
          }
        }}
      >
        {group.id !== null ? (
          <>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={disabled}
              draggable={!disabled}
              className="cursor-grab active:cursor-grabbing"
              aria-label={`${group.name.ko} 그룹 순서 드래그`}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", group.id!);
                onDrag({ kind: "group", id: group.id! });
              }}
              onDragEnd={() => {
                onDrag(null);
                onOver(null);
              }}
            >
              <GripVertical />
            </Button>
            <div className="grid min-w-48 flex-1 gap-3 sm:grid-cols-3">
              {(
                [
                  { locale: "ko", label: "한국어" },
                  { locale: "en", label: "영어" },
                  { locale: "ja", label: "일본어" },
                ] as const
              ).map(({ locale, label }) => (
                <div key={locale} className="space-y-1.5">
                  <Label
                    htmlFor={`group-${group.id}-${locale}`}
                    className="text-xs"
                  >
                    {label}
                  </Label>
                  <Input
                    id={`group-${group.id}-${locale}`}
                    lang={locale}
                    aria-label={`그룹 ${index + 1} ${label} 이름`}
                    value={group.name[locale]}
                    maxLength={80}
                    disabled={disabled}
                    placeholder={
                      locale === "ko" ? "그룹 이름" : "미입력 시 한국어 이름"
                    }
                    onChange={(event) =>
                      onChange({
                        ...layout,
                        groups: layout.groups.map((g) =>
                          g.id === group.id
                            ? {
                                ...g,
                                name: {
                                  ...g.name,
                                  [locale]: event.target.value,
                                },
                              }
                            : g,
                        ),
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <Button
              size="icon"
              variant="ghost"
              disabled={disabled || index === 0}
              aria-label={`${group.name.ko} 그룹 위로`}
              onClick={() =>
                onChange(
                  moveSidebarGroup(
                    layout,
                    group.id!,
                    layout.groups[index - 1].id,
                  ),
                )
              }
            >
              <ArrowUp />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={disabled || index === layout.groups.length - 1}
              aria-label={`${group.name.ko} 그룹 아래로`}
              onClick={() =>
                onChange(
                  moveSidebarGroup(
                    layout,
                    group.id!,
                    layout.groups[index + 2]?.id,
                  ),
                )
              }
            >
              <ArrowDown />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={disabled}
              aria-label={`${group.name.ko} 그룹 삭제`}
              onClick={() => {
                if (
                  group.musicIds.length &&
                  !window.confirm(
                    "그룹을 삭제하고 곡을 ‘그룹 없음’ 끝으로 이동할까요?",
                  )
                )
                  return;
                onChange({
                  groups: layout.groups.filter((g) => g.id !== group.id),
                  ungrouped: [...layout.ungrouped, ...group.musicIds],
                });
              }}
            >
              <Trash2 />
            </Button>
          </>
        ) : (
          <h2 className="flex-1 text-sm font-medium">
            그룹 없음{" "}
            <span className="text-xs text-muted-foreground">
              · 추천 목록 맨 아래
            </span>
          </h2>
        )}
        <span className="text-xs text-muted-foreground">
          {group.musicIds.length}곡
        </span>
      </div>
      <ul className="divide-y">
        {group.musicIds.map((id, songIndex) => {
          const song = songs.get(id);
          return (
            <li
              key={id}
              className={cn(
                "flex flex-wrap items-center gap-2 p-2",
                over === `song:${id}` && "border-t-2 border-t-primary",
                drag?.kind === "song" && drag.id === id && "opacity-40",
              )}
              onDragOver={(event) => {
                if (!disabled && drag?.kind === "song") {
                  event.preventDefault();
                  event.stopPropagation();
                  onOver(`song:${id}`);
                }
              }}
              onDrop={(event) => {
                if (!disabled && drag?.kind === "song") {
                  event.preventDefault();
                  event.stopPropagation();
                  onDropSong(group.id, id);
                }
              }}
            >
              <Button
                size="icon"
                variant="ghost"
                disabled={disabled}
                draggable={!disabled}
                className="cursor-grab active:cursor-grabbing"
                aria-label={`${song?.title} 순서 드래그`}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(id));
                  onDrag({ kind: "song", id });
                }}
                onDragEnd={() => {
                  onDrag(null);
                  onOver(null);
                }}
              >
                <GripVertical />
              </Button>
              <div className="min-w-24 flex-1">
                <p lang="ja" className="text-sm font-medium">
                  {song?.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {song?.korTitle}
                </p>
              </div>
              <NativeSelect
                className="w-36"
                value={group.id ?? ""}
                disabled={disabled}
                aria-label={`${song?.title} 그룹 이동`}
                onChange={(event) =>
                  onChange(
                    moveSidebarSong(layout, id, event.target.value || null),
                  )
                }
              >
                <NativeSelectOption value="">그룹 없음</NativeSelectOption>
                {layout.groups.map((g) => (
                  <NativeSelectOption key={g.id} value={g.id}>
                    {g.name.ko || "이름 없음"}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Button
                size="icon"
                variant="ghost"
                disabled={disabled || songIndex === 0}
                aria-label={`${song?.title} 위로`}
                onClick={() =>
                  onChange(
                    moveSidebarSong(
                      layout,
                      id,
                      group.id,
                      group.musicIds[songIndex - 1],
                    ),
                  )
                }
              >
                <ArrowUp />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                disabled={disabled || songIndex === group.musicIds.length - 1}
                aria-label={`${song?.title} 아래로`}
                onClick={() =>
                  onChange(
                    moveSidebarSong(
                      layout,
                      id,
                      group.id,
                      group.musicIds[songIndex + 2],
                    ),
                  )
                }
              >
                <ArrowDown />
              </Button>
            </li>
          );
        })}
      </ul>
      <div
        className={cn(
          "m-2 rounded border border-dashed p-3 text-center text-xs text-muted-foreground",
          over === `end:${key}` && "border-primary bg-primary/10",
        )}
        onDragOver={(event) => {
          if (!disabled && drag?.kind === "song") {
            event.preventDefault();
            onOver(`end:${key}`);
          }
        }}
        onDrop={(event) => {
          if (!disabled && drag?.kind === "song") {
            event.preventDefault();
            onDropSong(group.id);
          }
        }}
      >
        {group.musicIds.length
          ? "여기에 놓으면 그룹의 마지막으로 이동합니다"
          : "곡을 여기로 드래그하거나 그룹 선택으로 이동하세요"}
      </div>
    </section>
  );
}
