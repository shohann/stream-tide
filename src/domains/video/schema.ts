import {
  integer,
  pgTable,
  serial,
  varchar,
  pgEnum,
  timestamp,
} from "drizzle-orm/pg-core";
import user from "../user/schema";
import { relations } from "drizzle-orm";

export const visibility = pgEnum("visibility", [
  "Public",
  "Private",
  "Unlisted",
]);

export const status = pgEnum("status", ["pending", "processed", "published"]);

const video = pgTable("video", {
  id: serial("id").primaryKey().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  viewCount: integer("view_count").default(0),
  visibility: visibility("visibility").default("Unlisted"),
  status: status("status").default("pending"),
  rawVideoUrl: varchar("raw_video_url", { length: 255 }),
  mp4VideoUrl: varchar("mp4_video_url", { length: 255 }),
  hlsVideoUrl: varchar("hls_video_url", { length: 255 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 255 }),
  cloudFolderId: varchar("cloud_folder_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),

  ownerId: integer("owner_id")
    .notNull()
    .references(() => user.id),
});

export const videoRelations = relations(video, ({ one }) => ({
  owner: one(user, {
    fields: [video.ownerId],
    references: [user.id],
  }),
}));

export default video;

export type Video = typeof video.$inferInsert;
export type SelectVideo = typeof video.$inferSelect;
