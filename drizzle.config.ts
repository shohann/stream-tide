import { defineConfig } from "drizzle-kit";
import configs from './src/configs';

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: configs.DB_URL
  },
  verbose: true,
  strict: true,
});

// 'postgresql://stream-tide:postgres@localhost:5454/stream-tide-db' as string
