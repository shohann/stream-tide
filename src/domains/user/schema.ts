import {
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const role = pgEnum("role", ["user", "admin"]);

const user = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  userName: varchar("user_name", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  imagePublicId: varchar("image_public_id", { length: 255 }),
  imageUrl: varchar("image_url", { length: 255 }),
  role: role("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export default user;

export type User = typeof user.$inferInsert;
export type SelectUser = typeof user.$inferSelect;
