import { z, object } from "zod";

export const createLike = z.object({
  body: object({
    videoId: z.number(),
  }),
});

export type createLikeType = z.infer<typeof createLike>["body"];
