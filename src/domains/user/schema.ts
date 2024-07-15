import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

const user = pgTable("user", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
});

export default user;
