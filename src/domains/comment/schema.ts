import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import user from "../user/schema";
import { relations } from "drizzle-orm";
import video from "../video/schema";

const comment = pgTable("comment", {
  id: serial("id").primaryKey().notNull(),
  content: varchar("content", { length: 500 }).notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id),

  videoId: integer("video_id")
    .notNull()
    .references(() => video.id),
});

export const commentRelations = relations(comment, ({ one }) => ({
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
  video: one(video, {
    fields: [comment.videoId],
    references: [video.id],
  }),
}));

export default comment;

export type Comment = typeof comment.$inferInsert;
export type SelectComment = typeof comment.$inferSelect;
