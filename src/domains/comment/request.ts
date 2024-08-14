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

export const updateComment = z.object({
  body: object({
    content: z
      .string()
      .min(8, { message: "Content must be at least 8 characters long" })
      .max(200, { message: "Content must be 200 characters or less" }),
  }),
});

export const updateCommentParams = z.object({
  params: object({
    commentId: z.string().regex(/^\d+$/),
  }),
});

export type updateCommentParamsType = z.infer<
  typeof updateCommentParams
>["params"];

export type updateCommentType = z.infer<typeof updateComment>["body"];
