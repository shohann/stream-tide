import commentSchema, { Comment, SelectComment } from "./schema";
import db from "../../services/database-service";
import { desc, eq, sql } from "drizzle-orm";
import postgres from "postgres";
import userSchema from "../user/schema";
import { CommentWithUser, CreatedComment } from "./type";

export const createComment = async (data: Comment): Promise<CreatedComment> => {
  const [createdComment] = await db
    .insert(commentSchema)
    .values({
      userId: data.userId,
      videoId: data.videoId,
      content: data.content,
    })
    .returning();

  return {
    id: createdComment.id,
    content: createdComment.content,
    userId: createdComment.userId,
    videoId: createdComment.videoId,
    createdAt: createdComment.createdAt,
    updatedAt: createdComment.updatedAt,
  };
};

export const removeCommentById = async (commentId: number): Promise<void> => {
  await db.delete(commentSchema).where(eq(commentSchema.id, commentId));
};

export const checkUserCommentById = async (
  commentId: number,
  userId: number
) => {
  const isCommentExist =
    await sql`select exists (select 1 from ${commentSchema} where ${commentSchema.id} = ${commentId} and ${commentSchema.userId} = ${userId})`;
  const result: postgres.RowList<Record<string, unknown>[]> = await db.execute(
    isCommentExist
  );

  return result[0].exists;
};

interface CommentExistanceAndOwnership {
  isExist: boolean;
  isOwner: boolean;
}

export const checkCommentExistanceAndOwnership = async (
  commentId: number,
  userId: number
): Promise<CommentExistanceAndOwnership> => {
  const result = await sql`
  SELECT 
    EXISTS (
      SELECT 1
      FROM ${commentSchema}
      WHERE ${commentSchema.id} = ${commentId} 
    ) as is_exist,
    EXISTS (
      SELECT 1
      FROM ${commentSchema}
      WHERE ${commentSchema.id} = ${commentId} AND ${commentSchema.userId} = ${userId}
    ) as is_owner
`;

  const final: postgres.RowList<Record<string, unknown>[]> = await db.execute(
    result
  );

  return {
    isExist: final[0].is_exist as boolean,
    isOwner: final[0].is_owner as boolean,
  };
};

export const updateCommentById = async (data: {
  content: string;
  commentId: number;
}): Promise<CreatedComment> => {
  const [updatedComment] = await db
    .update(commentSchema)
    .set({
      content: data.content,
    })
    .where(eq(commentSchema.id, data.commentId))
    .returning();

  return {
    id: updatedComment.id,
    content: updatedComment.content,
    userId: updatedComment.userId,
    videoId: updatedComment.videoId,
    createdAt: updatedComment.createdAt,
    updatedAt: updatedComment.updatedAt,
  };
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
  videoId: number,
  page: number = 1,
  size: number = 10
): Promise<CommentWithUser[] | []> => {
  const comment = await db
    .select({
      id: commentSchema.id,
      content: commentSchema.content,
      createdAt: commentSchema.createdAt,
      updatedAt: commentSchema.updatedAt,
      user: {
        id: userSchema.id,
        firstName: userSchema.firstName,
        lastName: userSchema.lastName,
      },
    })
    .from(commentSchema)
    .leftJoin(userSchema, eq(commentSchema.userId, userSchema.id))
    .where(eq(commentSchema.videoId, videoId))
    .orderBy(desc(commentSchema.createdAt))
    .limit(size) // the number of rows to return
    .offset((page - 1) * size); // the number of rows to skip

  return comment;
};

export const getCommentsCountByVideoId = async (
  videoId: number
): Promise<number> => {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(commentSchema)
    .where(eq(commentSchema.videoId, videoId));

  return Number(count);
};
