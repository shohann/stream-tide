import { pgTable, serial } from "drizzle-orm/pg-core";

const playlist = pgTable(
  "playlist",
  {
    id: serial("id").primaryKey(),
  }
);

export default playlist;