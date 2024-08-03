import { AppError } from "../../libraries/error-handling/AppError";
import * as likeRepository from "./repository";
import * as videoRepository from "../../domains/video/repository";
import { CreateVideoLikeRequestDTO } from "../video/type";

const model = "Like";

export const createLike = async (
  data: CreateVideoLikeRequestDTO
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

    await likeRepository.createLike({
      userId: data.userId,
      videoId: data.videoId,
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
