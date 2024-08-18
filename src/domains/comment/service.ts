import { AppError } from "../../libraries/error-handling/AppError";
import { HTTP_ERRORS } from "../../libraries/error-handling/error-codes";
import * as commentRepository from "./repository";
import * as videoRepository from "../video/repository";
import { Comment } from "./schema";
import {
  CommentListRequestDTO,
  CommentListResponseDTO,
  CreateCommentRequestDTO,
  CreateCommentResponseDTO,
  UpdateCommentRequestDTO,
  UpdateCommentResponseDTO,
} from "./type";
import { calculatePagination } from "../../libraries/util/response";

export const getCommentList = async (
  data: CommentListRequestDTO
): Promise<CommentListResponseDTO> => {
  if (!data.page && !data.size) {
    data.page = 1;
    data.size = 10;
  }

  const comments = await commentRepository.getCommentsByVideoId(
    data.videoId,
    data.page,
    data.size
  );
  const totalItems = await commentRepository.getCommentsCountByVideoId(
    data.videoId
  );
  const pagination = calculatePagination(data.page, data.size, totalItems);

  return {
    data: comments,
    pagination,
  };
};

export const getCommentDetails = async (
  commentId: number
): Promise<Partial<Comment>> => {
  const commentDetails = await commentRepository.getCommentDetails(commentId);

  if (!commentDetails) {
    throw new AppError(
      HTTP_ERRORS.NotFound.name,
      `Comment unavailable`,
      HTTP_ERRORS.NotFound.code
    );
  }

  return commentDetails;
};

export const createComment = async (
  data: CreateCommentRequestDTO
): Promise<CreateCommentResponseDTO> => {
  const isPublished = await videoRepository.checkPublishedVideoById(
    data.videoId
  );

  if (isPublished === false) {
    throw new AppError(
      HTTP_ERRORS.NotFound.name,
      `Comment unavailable`,
      HTTP_ERRORS.NotFound.code
    );
  }

  const createdComment = await commentRepository.createComment({
    userId: data.userId,
    videoId: data.videoId,
    content: data.content,
  });

  return {
    id: createdComment.id,
    content: createdComment.content,
    userId: createdComment.userId,
    videoId: createdComment.videoId,
    createdAt: createdComment.createdAt,
  };
};

export const removeComment = async (commentId: number, userId: number) => {
  const validComment =
    await commentRepository.checkCommentExistanceAndOwnership(
      commentId,
      userId
    );

  if (validComment.isExist === false) {
    throw new AppError(
      HTTP_ERRORS.NotFound.name,
      `Comment unavailable`,
      HTTP_ERRORS.NotFound.code
    );
  }

  if (validComment.isOwner === false) {
    throw new AppError(
      HTTP_ERRORS.Unauthorized.name,
      `You are not allowed to update this commemnt`,
      HTTP_ERRORS.Unauthorized.code
    );
  }

  await commentRepository.removeCommentById(commentId);
};

export const updateComment = async (
  data: UpdateCommentRequestDTO
): Promise<UpdateCommentResponseDTO> => {
  const validComment =
    await commentRepository.checkCommentExistanceAndOwnership(
      data.commentId,
      data.userId
    );

  if (validComment.isExist === false) {
    throw new AppError(
      HTTP_ERRORS.NotFound.name,
      `Comment unavailable`,
      HTTP_ERRORS.NotFound.code
    );
  }

  if (validComment.isOwner === false) {
    throw new AppError(
      HTTP_ERRORS.Unauthorized.name,
      `You are not allowed to update this commemnt`,
      HTTP_ERRORS.Unauthorized.code
    );
  }

  const updatedComment = await commentRepository.updateCommentById({
    commentId: data.commentId,
    content: data.content,
  });

  return {
    id: updatedComment.id,
    content: updatedComment.content,
    userId: updatedComment.userId,
    videoId: updatedComment.videoId,
    createdAt: updatedComment.createdAt,
    updatedAt: updatedComment.updatedAt,
  };
};
