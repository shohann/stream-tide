import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schemas";

const URL = "postgresql://stream-tide:postgres@localhost:5454/stream-tide-db";

export const connection = postgres(URL, {
  max: 1,
});

export const db = drizzle(connection, {
  schema,
  logger: true,
});

export type db = typeof db;

export default db;
