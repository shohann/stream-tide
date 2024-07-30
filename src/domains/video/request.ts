import { object, z } from "zod";

export const createVideo = z.object({
  body: object({
    title: z
      .string()
      .min(5, { message: "Title must be at least 5 characters long" })
      .max(100, { message: "Title must be 100 characters or less" }),
    description: z
      .string()
      .min(5, { message: "Description must be at least 5 characters long" })
      .max(100, { message: "Description must be 100 characters or less" }),
  }),
});

export type createVideoBody = z.infer<typeof createVideo>["body"];
