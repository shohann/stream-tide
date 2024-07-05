import { relations } from "drizzle-orm";
import { pgTable, serial, varchar, unique, timestamp, integer, text } from "drizzle-orm/pg-core";
import user from "./user";

const post = pgTable('posts', {
    id: serial('id').primaryKey(),
    content: text('content'),
    authorId: integer('author_id').notNull().references(() => user.id),
});

export const postRelations = relations(post, ({ one }) => ({
    author: one(user, {
        fields: [post.authorId],
        references: [user.id],
        relationName: 'author'
    })
}));

export default post;