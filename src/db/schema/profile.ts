import { pgTable, serial, varchar, unique, timestamp, integer} from "drizzle-orm/pg-core";

const profile = pgTable(
    "profiles",
    {
        id: serial("id").primaryKey(),
        state: varchar("state", { length: 255 }).notNull()
    }
);

export default profile;