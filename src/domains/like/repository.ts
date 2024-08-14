import likeSchema, { Like, SelectLike } from "./schema";
import db from "../../services/database-service";
import { count, eq, sql } from "drizzle-orm";
import postgres from "postgres";

export const createLike = async (data: Like): Promise<void> => {
  try {
    await db.insert(likeSchema).values({
      userId: data.userId,
      videoId: data.videoId,
    });
  } catch (error) {
    throw error;
  }
};

export const removeLikeById = async (likeId: number): Promise<void> => {
  await db.delete(likeSchema).where(eq(likeSchema.id, likeId));
};

export const countLikeByVideoId = async (videoId: number): Promise<number> => {
  try {
    const likeCount = await db
      .select({ value: count() })
      .from(likeSchema)
      .where(eq(likeSchema.videoId, videoId));

    return likeCount[0].value;
  } catch (error) {
    throw error;
  }
};

export const checkUserLikeById = async (
  likeId: number,
  userId: number
): Promise<unknown> => {
  const isLikeExist =
    await sql`select exists (select 1 from ${likeSchema} where ${likeSchema.id} = ${likeId} and ${likeSchema.userId} = ${userId})`;
  const result: postgres.RowList<Record<string, unknown>[]> = await db.execute(
    isLikeExist
  );

  return result[0].exists;
};

export const checkLikeStatusByVideoId = async (
  userId: number,
  videoId: number
) => {
  try {
    const isLikeExist =
      await sql`select exists (select 1 from ${likeSchema} where ${likeSchema.userId} = ${userId} and ${likeSchema.videoId} = ${videoId})`;
    const result: postgres.RowList<Record<string, unknown>[]> =
      await db.execute(isLikeExist);

    return result[0].exists;
  } catch (error) {
    throw error;
  }
};
