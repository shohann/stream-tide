import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: 'postgresql://stream-tide:postgres@localhost:5454/stream-tide-db' as string
  },
  verbose: true,
  strict: true,
});
