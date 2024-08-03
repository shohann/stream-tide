import likeSchema, { Like, SelectLike } from "./schema";
import db from "../../services/database-service";
import { eq, sql } from "drizzle-orm";
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
