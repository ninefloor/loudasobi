import "server-only";
import { count, eq, isNull } from "drizzle-orm";
import { requireAdminSession } from "@/server/auth/access";
import { getDb } from "@/server/db";
import {
  musics,
  musicSettings,
  lyricTracks,
  callGuides,
} from "@/server/db/schema";

export async function getAdminConnectionStatus() {
  await requireAdminSession();
  try {
    const db = getDb();
    const [music, settings, lyrics, guides] = await Promise.all([
      db
        .select({ total: count() })
        .from(musics)
        .where(isNull(musics.deletedAt)),
      db
        .select({ total: count() })
        .from(musicSettings)
        .innerJoin(musics, eq(musics.id, musicSettings.musicId))
        .where(isNull(musics.deletedAt)),
      db
        .select({ total: count() })
        .from(lyricTracks)
        .innerJoin(musics, eq(musics.id, lyricTracks.musicId))
        .where(isNull(musics.deletedAt)),
      db
        .select({ total: count() })
        .from(callGuides)
        .innerJoin(musics, eq(musics.id, callGuides.musicId))
        .where(isNull(musics.deletedAt)),
    ]);
    return {
      connected: true as const,
      music: music[0].total,
      settings: settings[0].total,
      lyrics: lyrics[0].total,
      guides: guides[0].total,
    };
  } catch {
    // Provider messages may contain connection details; do not send them to clients.
    return { connected: false as const };
  }
}
