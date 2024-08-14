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

export const videoListQuery = z.object({
  query: z
    .object({
      page: z.string().regex(/^\d+$/).optional(),
      size: z.string().regex(/^\d+$/).optional(),
      search: z.string().optional(),
    })
    .strict()
    .refine((data) => (data.page && data.size) || (!data.page && !data.size), {
      message: "Both 'page' and 'size' must be provided together.",
      path: ["page"], // This will show the error on the 'page' field
    }),
});

export type videoListQueryType = z.infer<typeof videoListQuery>["query"];
