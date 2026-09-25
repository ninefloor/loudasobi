import "server-only";
import { asc, eq, isNull } from "drizzle-orm";
import { requireAdminSession } from "@/server/auth/access";
import { getDb } from "@/server/db";
import { musics, musicSettings, lyricTracks } from "@/server/db/schema";
import type { AdminMusic } from "@/types/catalog";

export async function getAdminMusics(): Promise<AdminMusic[]> {
  await requireAdminSession();
  const rows = await getDb()
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
      sourceSync: lyricTracks.sync,
      trackId: lyricTracks.musicId,
    })
    .from(musics)
    .leftJoin(musicSettings, eq(musics.id, musicSettings.musicId))
    .leftJoin(lyricTracks, eq(musics.id, lyricTracks.musicId))
    .where(isNull(musics.deletedAt))
    .orderBy(asc(musics.id));
  return rows.map(({ trackId, ...row }) => ({
    ...row,
    publish: row.publish ?? false,
    syncOffset: row.syncOffset ?? 0,
    sourceSync: row.sourceSync ?? 0,
    hasLyrics: trackId !== null,
  }));
}
