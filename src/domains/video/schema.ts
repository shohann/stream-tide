import { pgTable, serial } from "drizzle-orm/pg-core";

const video = pgTable(
  "video",
  {
    id: serial("id").primaryKey(),
  }
);

export default video;