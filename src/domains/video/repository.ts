import videoSchema, { Video, SelectVideo } from "./schema";
import db from "../../services/database-service";
import { CreatedVideo, UpdateVideo } from "./type";
import { eq, sql } from "drizzle-orm";
import postgres from "postgres";

export const createVideo = async (data: Video): Promise<CreatedVideo> => {
  const [video] = await db
    .insert(videoSchema)
    .values({
      title: data.title,
      description: data.description,
    })
    .returning();

  return video;
};

// Need a select. if select is null we will not return the updated data
export const updateVideo = async (data: UpdateVideo) => {
  const [updatedVideo] = await db
    .update(videoSchema)
    .set({
      title: data.title,
      description: data.description,
      visibility: data.visibility,
      status: data.status,
      rawVideoUrl: data.rawVideoUrl,
      mp4VideoUrl: data.mp4VideoUrl,
      hlsVideoUrl: data.hlsVideoUrl,
      thumbnailUrl: data.thumbnailUrl,
      cloudFolderId: data.cloudFolderId,
    })
    .where(eq(videoSchema.id, data.id))
    .returning();

  return updatedVideo;
};

export const checkUserExistanceById = async (id: number) => {
  const isVideoExist =
    await sql`select exists (select 1 from ${videoSchema} where ${videoSchema.id} = ${id})`;
  const result: postgres.RowList<Record<string, unknown>[]> = await db.execute(
    isVideoExist
  );

  return result[0].exists;
};
