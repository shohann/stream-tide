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

const visibility = z.enum(["Public", "Private"]);

export const updateVideo = z.object({
  body: z
    .object({
      title: z
        .string()
        .min(5, { message: "Title must be at least 5 characters long" })
        .max(100, { message: "Title must be 100 characters or less" })
        .optional(),
      description: z
        .string()
        .min(5, { message: "Description must be at least 5 characters long" })
        .max(100, { message: "Description must be 100 characters or less" })
        .optional(),
      visibility: visibility.optional(),
    })
    .strict(),
});
export type updateVideoBody = z.infer<typeof updateVideo>["body"];

export const updateVideoParams = z.object({
  params: z.object({
    videoId: z.string().regex(/^\d+$/),
  }),
});

export type updateVideoParamsType = z.infer<typeof updateVideoParams>["params"];
