import commentSchema, { Comment, SelectComment } from "./schema";
import db from "../../services/database-service";
import { eq, sql } from "drizzle-orm";
import postgres from "postgres";

export const createComment = async (data: Comment): Promise<void> => {
  try {
    await db.insert(commentSchema).values({
      userId: data.userId,
      videoId: data.videoId,
      content: data.content,
    });
  } catch (error) {
    throw error;
  }
};
