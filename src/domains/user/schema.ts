import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

const user = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  userName: varchar("user_name", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export default user;

export type User = typeof user.$inferInsert;
export type SelectUser = typeof user.$inferSelect;
