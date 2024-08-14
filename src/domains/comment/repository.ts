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

export const removeCommentById = async (commentId: number): Promise<void> => {
  try {
    await db.delete(commentSchema).where(eq(commentSchema.id, commentId));
  } catch (error) {
    throw error;
  }
};

export const checkUserCommentById = async (
  commentId: number,
  userId: number
) => {
  try {
    const isCommentExist =
      await sql`select exists (select 1 from ${commentSchema} where ${commentSchema.id} = ${commentId} and ${commentSchema.userId} = ${userId})`;
    const result: postgres.RowList<Record<string, unknown>[]> =
      await db.execute(isCommentExist);

    return result[0].exists;
  } catch (error) {
    throw error;
  }
};

export const updateCommentById = async (data: {
  content: string;
  commentId: number;
}) => {
  try {
    const [updatedComment] = await db
      .update(commentSchema)
      .set({
        content: data.content,
      })
      .where(eq(commentSchema.id, data.commentId))
      .returning();

    return updatedComment;
  } catch (error) {
    throw error;
  }
};

export const getCommentDetails = async (
  commentId: number
): Promise<Comment | null> => {
  const details = await db
    .select()
    .from(commentSchema)
    .where(eq(commentSchema.id, commentId));

  return details[0];
};

export const getCommentsByVideoId = async (
  videoId: number
): Promise<Comment[]> => {
  try {
    const comment = await db
      .select()
      .from(commentSchema)
      .where(eq(commentSchema.videoId, videoId));

    return comment;
  } catch (error) {
    throw error;
  }
};
