import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Runtime mapping only. All shared DB migrations belong to MONOASOBI.
export const sidebarSettings = sqliteTable("loudasobi_sidebar_settings", {
  id: integer("id").primaryKey(),
  layoutJson: text("layout_json", { mode: "json" }).notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const musics = sqliteTable("musics", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  korTitle: text("kor_title").notNull(),
  enTitle: text("en_title").notNull(),
  deletedAt: text("deleted_at"),
});
export const musicSettings = sqliteTable("loudasobi_music_settings", {
  musicId: integer("music_id")
    .primaryKey()
    .references(() => musics.id),
  youtubeId: text("youtube_id"),
  fanLightColor: text("fan_light_color"),
  bpm: real("bpm"),
  publish: integer("publish", { mode: "boolean" }).notNull().default(false),
  syncOffset: real("sync_offset").notNull().default(0),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export const lyricTracks = sqliteTable("lyric_tracks", {
  musicId: integer("music_id")
    .primaryKey()
    .references(() => musics.id),
  sync: real("sync").notNull().default(0),
  lyricJson: text("lyric_json", { mode: "json" }).notNull(),
});
export const callGuides = sqliteTable("loudasobi_call_guides", {
  musicId: integer("music_id")
    .primaryKey()
    .references(() => musics.id),
  guideJson: text("guide_json", { mode: "json" }).notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
