import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import user from "../user/schema";
import { relations } from "drizzle-orm";
import video from "../video/schema";

const like = pgTable("like", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id),
  videoId: integer("video_id")
    .notNull()
    .references(() => video.id),
});

export const likeRelations = relations(like, ({ one }) => ({
  user: one(user, {
    fields: [like.userId],
    references: [user.id],
  }),
  video: one(video, {
    fields: [like.videoId],
    references: [video.id],
  }),
}));

export default like;

export type Like = typeof like.$inferInsert;
export type SelectLike = typeof like.$inferSelect;
