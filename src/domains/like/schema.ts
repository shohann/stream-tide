import { pgTable, serial } from "drizzle-orm/pg-core";

const like = pgTable(
  "like",
  {
    id: serial("id").primaryKey(),
  }
);

export default like;