import "server-only";
import { createHash } from "node:crypto";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/server/db";
import { musics, musicSettings, sidebarSettings } from "@/server/db/schema";
import { requireAdminSession } from "@/server/auth/access";
import { projectSidebar, sidebarLayoutSchema } from "@/lib/sidebarOrder";

type Reader = Pick<ReturnType<typeof getDb>, "select">;
export async function readSidebarLayout(db: Reader = getDb()) {
  const [row] = await db
    .select()
    .from(sidebarSettings)
    .where(eq(sidebarSettings.id, 1));
  return sidebarLayoutSchema.parse(
    row?.layoutJson ?? { groups: [], ungrouped: [] },
  );
}
export async function readAdminSidebar(db: Reader = getDb()) {
  await requireAdminSession();
  const layout = await readSidebarLayout(db);
  const songs = await db
    .select({ id: musics.id, title: musics.title, korTitle: musics.korTitle })
    .from(musics)
    .innerJoin(musicSettings, eq(musics.id, musicSettings.musicId))
    .where(and(isNull(musics.deletedAt), eq(musicSettings.publish, true)))
    .orderBy(asc(musics.id));
  return {
    layout: projectSidebar(
      layout,
      songs.map((s) => s.id),
    ),
    songs,
    revision: createHash("sha256")
      .update(JSON.stringify({ layout, songs }))
      .digest("hex"),
  };
}
export type SidebarDocument = Awaited<ReturnType<typeof readAdminSidebar>>;
