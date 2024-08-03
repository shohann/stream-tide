import { AppError } from "../../libraries/error-handling/AppError";
import * as commentRepository from "./repository";
import * as videoRepository from "../video/repository";
const model = "Comment";

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

export const search = async () => {
  try {
  } catch (error: any) {
    console.error(`search(): Failed to create ${model}`, error);
    throw new AppError(`Failed to create ${model}`, error.message);
  }
};

export const getById = async () => {
  try {
  } catch (error: any) {
    console.error(`getById(): Failed to create ${model}`, error);
    throw new AppError(`Failed to create ${model}`, error.message);
  }
};

export const updateById = async () => {
  try {
  } catch (error: any) {
    console.error(`updateById(): Failed to create ${model}`, error);
    throw new AppError(`Failed to create ${model}`, error.message);
  }
};

export const deleteById = async () => {
  try {
  } catch (error: any) {
    console.error(`deleteById(): Failed to create ${model}`, error);
    throw new AppError(`Failed to create ${model}`, error.message);
  }
};
