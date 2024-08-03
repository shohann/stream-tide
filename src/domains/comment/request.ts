import { z, object } from "zod";

export const createComment = z.object({
  body: object({
    videoId: z.number(),
    content: z
      .string()
      .min(8, { message: "Content must be at least 8 characters long" })
      .max(100, { message: "Content must be 100 characters or less" }),
  }),
});

export type createCommentType = z.infer<typeof createComment>["body"];
