import "server-only";
import { getDb } from "@/server/db";
import { sidebarSettings } from "@/server/db/schema";
import { requireAdminWriteAccess } from "@/server/auth/access";
import { readAdminSidebar } from "@/server/queries/sidebar";
import {
  sidebarLayoutSchema,
  sidebarMusicIds,
  type SidebarLayout,
} from "@/lib/sidebarOrder";

export async function saveSidebar(revision: string, input: SidebarLayout) {
  await requireAdminWriteAccess();
  const layout = sidebarLayoutSchema.parse(input);
  return getDb().transaction(async (tx) => {
    const current = await readAdminSidebar(tx);
    if (revision !== current.revision)
      return {
        status: 409,
        error:
          "공개곡 또는 추천 목록이 변경되었습니다. 초안을 보관하고 최신 목록을 다시 불러와 주세요.",
      };
    const ids = new Set(sidebarMusicIds(layout));
    if (
      ids.size !== current.songs.length ||
      current.songs.some((s) => !ids.has(s.id))
    )
      return {
        status: 400,
        error: "현재 공개된 곡을 중복이나 누락 없이 배치해 주세요.",
      };
    const values = { layoutJson: layout, updatedAt: new Date().toISOString() };
    await tx
      .insert(sidebarSettings)
      .values({ id: 1, ...values })
      .onConflictDoUpdate({ target: sidebarSettings.id, set: values });
    return { status: 200, document: await readAdminSidebar(tx) };
  });
}
