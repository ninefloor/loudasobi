import { z } from "zod";

const ids = z.array(z.number().int().nonnegative().safe()).max(5000);
export const sidebarLayoutSchema = z
  .object({
    groups: z
      .array(
        z
          .object({
            id: z
              .string()
              .min(1)
              .max(100)
              .refine((id) => id !== "ungrouped"),
            name: z.union([
              z
                .string()
                .trim()
                .min(1)
                .max(80)
                .transform((ko) => ({ ko, en: "", ja: "" })),
              z
                .object({
                  ko: z.string().trim().min(1).max(80),
                  en: z.string().trim().max(80).default(""),
                  ja: z.string().trim().max(80).default(""),
                })
                .strict(),
            ]),
            musicIds: ids,
          })
          .strict(),
      )
      .max(100),
    ungrouped: ids,
  })
  .strict()
  .superRefine((value, context) => {
    const songs = sidebarMusicIds(value);
    if (
      new Set(songs).size !== songs.length ||
      new Set(value.groups.map((g) => g.id)).size !== value.groups.length
    )
      context.addIssue({
        code: "custom",
        message: "곡이나 그룹이 중복되었습니다.",
      });
  });
export type SidebarLayout = z.infer<typeof sidebarLayoutSchema>;
export const sidebarMusicIds = (layout: SidebarLayout): number[] => [
  ...layout.groups.flatMap((group) => group.musicIds),
  ...layout.ungrouped,
];

// Only published IDs survive projection; newly published songs append in catalog order.
export function projectSidebar(
  layout: SidebarLayout,
  publishedIds: number[],
): SidebarLayout {
  const remaining = new Set(publishedIds);
  const take = (ids: number[]) => ids.filter((id) => remaining.delete(id));
  const groups = layout.groups.map((group) => ({
    ...group,
    musicIds: take(group.musicIds),
  }));
  const ungrouped = [...take(layout.ungrouped), ...remaining];
  return { groups, ungrouped };
}

export function moveSidebarSong(
  layout: SidebarLayout,
  id: number,
  groupId: string | null,
  before?: number,
): SidebarLayout {
  if (
    !sidebarMusicIds(layout).includes(id) ||
    before === id ||
    (groupId !== null && !layout.groups.some((g) => g.id === groupId))
  )
    return layout;
  const next = {
    groups: layout.groups.map((g) => ({
      ...g,
      musicIds: g.musicIds.filter((item) => item !== id),
    })),
    ungrouped: layout.ungrouped.filter((item) => item !== id),
  };
  const target =
    groupId === null
      ? next.ungrouped
      : next.groups.find((g) => g.id === groupId)!.musicIds;
  const index = before === undefined ? -1 : target.indexOf(before);
  target.splice(index < 0 ? target.length : index, 0, id);
  return next;
}

export function moveSidebarGroup(
  layout: SidebarLayout,
  id: string,
  before?: string,
): SidebarLayout {
  const group = layout.groups.find((g) => g.id === id);
  if (!group || id === before) return layout;
  const groups = layout.groups.filter((g) => g.id !== id);
  const index =
    before === undefined ? -1 : groups.findIndex((g) => g.id === before);
  groups.splice(index < 0 ? groups.length : index, 0, group);
  return { ...layout, groups };
}
