import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db";
import {
  musics,
  musicSettings,
  lyricTracks,
  callGuides,
} from "@/server/db/schema";
import { parseGuide, resolveGuide } from "@/lib/callGuide";
import type { CatalogEntry } from "@/types/catalog";

export const linesSchema = z
  .array(
    z.object({
      // Legacy source rows remain readable until MONOASOBI ID backfill is deployed.
      id: z.string().min(1).optional(),
      start: z.number().finite().nonnegative(),
      end: z.number().finite(),
      jp: z.string(),
      kr: z.string(),
      jpReading: z.string(),
      en: z.string().optional(),
      enReading: z.string().optional(),
    }),
  )
  .superRefine((lines, ctx) => {
    const ids = new Set<string>();
    lines.forEach((line, index) => {
      if (
        (line.id !== undefined && ids.has(line.id)) ||
        line.end <= line.start ||
        (index > 0 && line.start < lines[index - 1].end)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid lyric timeline",
          path: [index],
        });
      }
      if (line.id) ids.add(line.id);
    });
  });

// No shared MV fallback, static fallback, or cross-request cache.
export async function getPublicCatalog(): Promise<CatalogEntry[]> {
  const rows = await getDb()
    .select({
      id: musics.id,
      title: musics.title,
      korTitle: musics.korTitle,
      enTitle: musics.enTitle,
      youtubeId: musicSettings.youtubeId,
      fanLightColor: musicSettings.fanLightColor,
      trackId: lyricTracks.musicId,
      sync: lyricTracks.sync,
      syncOffset: musicSettings.syncOffset,
      lyricJson: lyricTracks.lyricJson,
      guideJson: callGuides.guideJson,
    })
    .from(musics)
    .innerJoin(musicSettings, eq(musics.id, musicSettings.musicId))
    .leftJoin(lyricTracks, eq(musics.id, lyricTracks.musicId))
    .leftJoin(callGuides, eq(musics.id, callGuides.musicId))
    .where(and(isNull(musics.deletedAt), eq(musicSettings.publish, true)))
    .orderBy(asc(musics.id));
  return rows.map((row) => ({
    sections: resolveGuide(
      parseGuide(row.guideJson),
      linesSchema.parse(row.lyricJson ?? []),
    ).sections,
    music: {
      id: row.id,
      title: row.title,
      korTitle: row.korTitle,
      enTitle: row.enTitle,
      youtubeId: z
        .string()
        .regex(/^[A-Za-z0-9_-]{11}$/)
        .parse(row.youtubeId),
      fanLightColor: row.fanLightColor ?? undefined,
    },
    track:
      row.trackId === null && row.guideJson === null
        ? undefined
        : {
            id: row.id,
            sync:
              z
                .number()
                .finite()
                .parse(row.sync ?? 0) +
              z.number().finite().parse(row.syncOffset),
            lyric: linesSchema.parse(row.lyricJson ?? []),
          },
  }));
}
