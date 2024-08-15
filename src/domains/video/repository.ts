import videoSchema, { Video } from "./schema";
import db from "../../services/database-service";
import {
  CreatedVideo,
  GetOwnVideoDetails,
  GetPublishedVideoDetailsDTO,
  PublishedVideoList,
  UpdateVideo,
} from "./type";
import { eq, sql, and, asc } from "drizzle-orm";
import postgres from "postgres";
import userSchema from "../user/schema";
import { boolean } from "drizzle-orm/mysql-core";

enum VIDEO_VISIBILITIES {
  PUBLIC = "Public",
  PRIVATE = "Private",
  UNLISTED = "Unlisted",
}

export const createVideo = async (data: Video): Promise<CreatedVideo> => {
  const [video] = await db
    .insert(videoSchema)
    .values({
      ownerId: data.ownerId,
      title: data.title,
      description: data.description,
      rawVideoUrl: data.rawVideoUrl,
      cloudFolderId: data.cloudFolderId,
    })
    .returning();

  return video;
};

export const getPublishedVideos = async (
  page: number = 1,
  size: number = 10
): Promise<PublishedVideoList[] | []> => {
  try {
    const videos = await db
      .select({
        id: videoSchema.id,
        title: videoSchema.title,
        viewCount: videoSchema.viewCount,
        thumbnailUrl: videoSchema.thumbnailUrl,
        createdAt: videoSchema.createdAt,
        visibility: videoSchema.visibility,
        owner: {
          id: userSchema.id,
          firstName: userSchema.firstName,
          lastName: userSchema.lastName,
        },
      })
      .from(videoSchema)
      .leftJoin(userSchema, eq(videoSchema.ownerId, userSchema.id))
      .where(eq(videoSchema.visibility, "Public"))
      .orderBy(asc(videoSchema.id))
      .limit(size) // the number of rows to return
      .offset((page - 1) * size); // the number of rows to skip

    return videos;
  } catch (error) {
    throw error;
  }
};

export const getPublishedVideosCount = async (): Promise<number> => {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoSchema)
      .where(eq(videoSchema.visibility, "Public"));

    return Number(count);
  } catch (error) {
    throw error;
  }
};

export const checkOwnVideoByIdAndReturn = async (
  videoId: number
): Promise<{ id: number; userId: number; folderId?: string } | null> => {
  try {
    const [result] = await db
      .select({
        id: videoSchema.id,
        userId: videoSchema.ownerId,
        folderId: videoSchema.cloudFolderId,
      })
      .from(videoSchema)
      .where(
        and(eq(videoSchema.status, "published"), eq(videoSchema.id, videoId))
      );

    if (result) {
      return {
        id: result.id,
        userId: result.userId,
        folderId: result.folderId ? result.folderId : undefined,
      };
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

export const getPublishedVideoDetails = async (
  videoId: number
): Promise<GetPublishedVideoDetailsDTO> => {
  try {
    const [result] = await db
      .select({
        id: videoSchema.id,
        title: videoSchema.title,
        description: videoSchema.description,
        viewCount: videoSchema.viewCount,
        hlsVideoUrl: videoSchema.hlsVideoUrl,
        createdAt: videoSchema.createdAt,
        visibility: videoSchema.visibility,
        owner: {
          id: userSchema.id,
          firstName: userSchema.firstName,
          lastName: userSchema.lastName,
        },
      })
      .from(videoSchema)
      .leftJoin(userSchema, eq(videoSchema.ownerId, userSchema.id))
      .where(
        and(eq(videoSchema.id, videoId), eq(videoSchema.visibility, "Public"))
      );

    return result;
  } catch (error) {
    throw error;
  }
};

export const updateVisiblityById = async (
  videoId: number,
  visibility: VIDEO_VISIBILITIES
) => {
  try {
    await db
      .update(videoSchema)
      .set({ visibility })
      .where(eq(videoSchema.id, videoId));
  } catch (error) {
    throw error;
  }
};

export const updateViewCount = async (videoId: number) => {
  try {
    await db
      .update(videoSchema)
      .set({
        viewCount: sql`${videoSchema.viewCount} + 1`,
      })
      .where(eq(videoSchema.id, videoId));
  } catch (error) {
    throw error;
  }
};

// TODO: Need a separte method which will not return any data
export const updateVideoAndReturn = async (data: UpdateVideo) => {
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

export const checkVideoExistanceById = async (id: number) => {
  const isVideoExist =
    await sql`select exists (select 1 from ${videoSchema} where ${videoSchema.id} = ${id})`;
  const result: postgres.RowList<Record<string, unknown>[]> = await db.execute(
    isVideoExist
  );

  return result[0].exists;
};

export const checkPublishedVideoById = async (id: number): Promise<unknown> => {
  const isVideoExist =
    await sql`select exists (select 1 from ${videoSchema} where ${videoSchema.id} = ${id} and ${videoSchema.status} = 'published')`;
  const result: postgres.RowList<Record<string, unknown>[]> = await db.execute(
    isVideoExist
  );

  return result[0].exists;
};

export const deleteVideoById = async (id: number): Promise<void> => {
  await db.delete(videoSchema).where(eq(videoSchema.id, id));
};

export const checkUserVideoExistanceById = async (
  id: number,
  userId: number
) => {
  const isVideoExist =
    await sql`select exists (select 1 from ${videoSchema} where ${videoSchema.id} = ${id} and ${videoSchema.ownerId} = ${userId})`;
  const result: postgres.RowList<Record<string, unknown>[]> = await db.execute(
    isVideoExist
  );

  return result[0].exists;
};

interface VideExistanceAndOwnership {
  isPublished: boolean;
  isOwner: boolean;
}

export const checkVideoExistanceAndOwnership = async (
  id: number,
  userId: number
): Promise<VideExistanceAndOwnership> => {
  const result = await sql`
  SELECT 
    EXISTS (
      SELECT 1
      FROM ${videoSchema}
      WHERE ${videoSchema.id} = ${id} AND ${videoSchema.status} = 'published'
    ) as isPublished,
    EXISTS (
      SELECT 1
      FROM ${videoSchema}
      WHERE ${videoSchema.id} = ${id} AND ${videoSchema.ownerId} = ${userId}
    ) as isOwner
`;

  const final: postgres.RowList<Record<string, unknown>[]> = await db.execute(
    result
  );

  return {
    isPublished: final[0].isPublished as boolean,
    isOwner: final[0].isOwner as boolean,
  };
};

export const getVideoDetails = async (
  videoId: number
): Promise<GetOwnVideoDetails | null> => {
  try {
    const [result] = await db
      .select({
        id: videoSchema.id,
        title: videoSchema.title,
        description: videoSchema.description,
        viewCount: videoSchema.viewCount,
        hlsVideoUrl: videoSchema.hlsVideoUrl,
        createdAt: videoSchema.createdAt,
        visibility: videoSchema.visibility,
        status: videoSchema.status,
        ownerId: videoSchema.ownerId,
      })
      .from(videoSchema)
      .where(eq(videoSchema.id, videoId));

    return result;
  } catch (error) {
    throw error;
  }
};
