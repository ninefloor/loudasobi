import "server-only";
import { createHash } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { requireAdminSession } from "@/server/auth/access";
import { getDb } from "@/server/db";
import {
  musics,
  musicSettings,
  lyricTracks,
  callGuides,
} from "@/server/db/schema";
import { linesSchema } from "@/server/queries/catalog";
import { parseGuide } from "@/lib/callGuide";

export async function readGuide(
  id: number,
  db: Pick<ReturnType<typeof getDb>, "select"> = getDb(),
) {
  await requireAdminSession();
  const [row] = await db
    .select({
      id: musics.id,
      title: musics.title,
      korTitle: musics.korTitle,
      enTitle: musics.enTitle,
      youtubeId: musicSettings.youtubeId,
      fanLightColor: musicSettings.fanLightColor,
      bpm: musicSettings.bpm,
      publish: musicSettings.publish,
      syncOffset: musicSettings.syncOffset,
      sync: lyricTracks.sync,
      lyricJson: lyricTracks.lyricJson,
      guideJson: callGuides.guideJson,
    })
    .from(musics)
    .leftJoin(musicSettings, eq(musics.id, musicSettings.musicId))
    .leftJoin(lyricTracks, eq(musics.id, lyricTracks.musicId))
    .leftJoin(callGuides, eq(musics.id, callGuides.musicId))
    .where(and(eq(musics.id, id), isNull(musics.deletedAt)));
  if (!row) return null;
  return {
    sourceSync: row.sync ?? 0,
    syncOffset: row.syncOffset ?? 0,
    music: {
      id: row.id,
      title: row.title,
      korTitle: row.korTitle,
      enTitle: row.enTitle,
      youtubeId: row.youtubeId ?? undefined,
      fanLightColor: row.fanLightColor ?? undefined,
      bpm: row.bpm ?? undefined,
    },
    track: {
      id,
      sync: (row.sync ?? 0) + (row.syncOffset ?? 0),
      lyric: linesSchema.parse(row.lyricJson ?? []),
    },
    publish: row.publish ?? false,
    guide: parseGuide(row.guideJson),
    revision: createHash("sha256").update(JSON.stringify(row)).digest("hex"),
  };
}
export type GuideDocument = NonNullable<Awaited<ReturnType<typeof readGuide>>>;
