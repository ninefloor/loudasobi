import "server-only";
import { getDb } from "@/server/db";
import { callGuides, musicSettings } from "@/server/db/schema";
import { z } from "zod";
import { requireAdminWriteAccess } from "@/server/auth/access";
import { readGuide } from "@/server/queries/guide";
import { guideSchema, resolveGuide, type CallGuide } from "@/lib/callGuide";

export async function saveGuide(
  id: number,
  revision: string,
  input: CallGuide,
  syncOffset?: number,
) {
  await requireAdminWriteAccess();
  const guide = guideSchema.parse(input);
  const offset = z
    .number()
    .finite()
    .min(-3600)
    .max(3600)
    .optional()
    .parse(syncOffset);
  return getDb().transaction(async (tx) => {
    const current = await readGuide(id, tx);
    if (!current) return { status: 404, error: "곡이 없거나 삭제되었습니다." };
    if (current.revision !== revision)
      return {
        status: 409,
        error:
          "가사·설정 또는 콜이 다른 곳에서 변경되었습니다. 초안을 복사해 보관하고 새로고침해 주세요.",
      };
    const { issues } = resolveGuide(guide, current.track.lyric);
    if (Object.keys(issues).length)
      return { status: 400, error: Object.values(issues)[0] };
    const effectiveSync = current.sourceSync + (offset ?? current.syncOffset);
    if (guide.cues.some((cue) => cue.start + effectiveSync < 0))
      return {
        status: 400,
        error: "재생 시작 전으로 이동한 콜 블록을 확인해 주세요.",
      };
    const values = { guideJson: guide, updatedAt: new Date().toISOString() };
    await tx
      .insert(callGuides)
      .values({ musicId: id, ...values })
      .onConflictDoUpdate({ target: callGuides.musicId, set: values });
    if (offset !== undefined)
      await tx
        .insert(musicSettings)
        .values({ musicId: id, syncOffset: offset })
        .onConflictDoUpdate({
          target: musicSettings.musicId,
          set: { syncOffset: offset, updatedAt: values.updatedAt },
        });
    return { status: 200, document: await readGuide(id, tx) };
  });
}
