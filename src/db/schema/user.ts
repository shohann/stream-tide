import { relations } from "drizzle-orm";
import { pgTable, serial, varchar, unique, timestamp, integer} from "drizzle-orm/pg-core";
import profile from "./profile";
import post from "./post";

const user = pgTable(
    "users",
    {
        id: serial("id").primaryKey(),
        firstName: varchar("first_name", { length: 255 }).notNull(),
        lastName: varchar("last_name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        password: varchar("password", { length: 255 }).notNull(),
        createdAt: timestamp('created_at').defaultNow(),
        profileId: integer("profile_id")
            .notNull()
            .unique()
            .references(() => profile.id)
    }
);

export const userRelations = relations(user, ({ one, many }) => ({
    profile: one(profile, {
        fields: [user.profileId],
        references: [profile.id],
      }),
    post: many(post),
}));

export default user;
  