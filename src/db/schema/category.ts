import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

const category = pgTable(
  "category",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
  }
);

export default category;