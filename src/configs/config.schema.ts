import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DB_URL: z.string().min(1),
  JWT_EXPIRATION: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  SALT: z.number().min(1),
  RATE: z.number().min(0),
  PORT: z.number().min(1000).default(4000),
  ENCRYPTION_KEY: z
    .string()
    .regex(/^\d+$/, { message: "ENCRYPTION_KEY must be a string of digits" })
    .transform((val) => Number(val)),
});

export type ConfigSchema = z.infer<typeof schema>;

export default schema;
