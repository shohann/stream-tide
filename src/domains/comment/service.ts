import { AppError } from "../../libraries/error-handling/AppError";
import * as commentRepository from "./repository";
import * as videoRepository from "../video/repository";
import { Comment } from "./schema";
const model = "Comment";

export const getCommentList = async (videoId: number): Promise<Comment[]> => {
  try {
    const comments = await commentRepository.getCommentsByVideoId(videoId);
    return comments;
  } catch (error) {
    throw error;
  }
};

export const getCommentDetails = async (
  commentId: number
): Promise<Partial<Comment>> => {
  try {
    const commentDetails = await commentRepository.getCommentDetails(commentId);

    if (!commentDetails) {
      throw new AppError(
        `${model}: Comment unavailable`,
        `${model}: Comment unavailable`,
        404
      );
    }

    return commentDetails;
  } catch (error) {
    throw error;
  }
};

export const createComment = async (
  data: CreateCommentRequestDTO
): Promise<void> => {
  try {
    const isPublished = await videoRepository.checkPublishedVideoById(
      data.videoId
    );

    if (isPublished === false) {
      throw new AppError(
        `${model}: Video unavailable`,
        `${model}: Video unavailable`,
        404
      );
    }

    await commentRepository.createComment({
      userId: data.userId,
      videoId: data.videoId,
      content: data.content,
    });
  } catch (error: any) {
    console.error(`create(): Failed to create ${model}`, error);
    throw error;
  }
};

export const removeComment = async (commentId: number, userId: number) => {
  try {
    const validComment = await commentRepository.checkUserCommentById(
      commentId,
      userId
    );

    if (validComment === false) {
      throw new AppError(
        `${model}: Comment unavailable`,
        `${model}: Comment unavailable`,
        404
      );
    }
    // TODO: Unauthorized error

    await commentRepository.removeCommentById(commentId);
  } catch (error: any) {
    console.error(`deleteById(): Failed to create ${model}`, error);
    throw error;
  }
};

export const updateComment = async (data: UpdateCommentRequestDTO) => {
  try {
    const validComment = await commentRepository.checkUserCommentById(
      data.commentId,
      data.userId
    );

    if (validComment === false) {
      throw new AppError(
        `${model}: Comment unavailable`,
        `${model}: Comment unavailable`,
        404
      );
    }
    // TODO: Unauthorized error

    await commentRepository.updateCommentById({
      commentId: data.commentId,
      content: data.content,
    });
  } catch (error: any) {
    console.error(`updateById(): Failed to create ${model}`, error);
    throw error;
  }
};
