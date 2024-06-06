import { pgTable, serial, varchar, unique, timestamp} from "drizzle-orm/pg-core";

const user = pgTable(
    "users",
    {
        id: serial("id").primaryKey(),
        firstName: varchar("first_name", { length: 255 }).notNull(),
        lastName: varchar("last_name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        password: varchar("password", { length: 255 }).notNull(),
        createdAt: timestamp('created_at').defaultNow(),
    }
);

export default user;