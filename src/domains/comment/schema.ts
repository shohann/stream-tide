import { pgTable, serial } from "drizzle-orm/pg-core";

const comment = pgTable(
  "comment",
  {
    id: serial("id").primaryKey(),
  }
);

export default comment;