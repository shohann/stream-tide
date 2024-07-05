import { pgTable, serial } from "drizzle-orm/pg-core";

const product = pgTable(
  "product",
  {
    id: serial("id").primaryKey(),
  }
);

export default product;