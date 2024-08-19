import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DB_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_EXPIRATION: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
  REFRESH_EXPIRES_IN: z.number().min(1),
  CLOUDINARY_NAME: z.string().min(1),
  API_KEY: z.string().min(1),
  API_SECRET: z.string().min(1),
  EMAIL_API_KEY: z.string().min(1),
  SALT: z.number().min(1),
  RATE: z.number().min(0),
  // PORT: z.number(),
  ENCRYPTION_KEY: z
    .string()
    .regex(/^\d+$/, { message: "ENCRYPTION_KEY must be a string of digits" })
    .transform((val) => Number(val)),
});

export type ConfigSchema = z.infer<typeof schema>;

export default schema;
