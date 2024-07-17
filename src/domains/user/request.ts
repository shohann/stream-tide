import { object, z } from "zod";

export const userDetailsParams = z.object({
  params: object({
    userId: z.string().regex(/^\d+$/),
  }),
});

export const userRegister = z.object({
  body: object({
    firstName: z
      .string()
      .min(1, { message: "First name is required" })
      .max(50, { message: "First name must be 50 characters or less" }),
    lastName: z
      .string()
      .min(1, { message: "Last name is required" })
      .max(50, { message: "Last name must be 50 characters or less" }),
    email: z.string().email({ message: "Invalid email address" }),
    userName: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" })
      .max(30, { message: "Username must be 30 characters or less" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
      }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(100, { message: "Password must be 100 characters or less" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),
  }),
  // query: object({
  //   search: z
  //     .string()
  //     .min(1, { message: "First name is required" })
  //     .max(50, { message: "First name must be 50 characters or less" }),
  // }),
});

// export type registerUserQuery = z.infer<typeof userRegister>["query"];
export type registerUserBody = z.infer<typeof userRegister>["body"];
