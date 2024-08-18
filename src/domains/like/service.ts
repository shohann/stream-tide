import { AppError } from "../../libraries/error-handling/AppError";
import * as likeRepository from "./repository";
import * as videoRepository from "../../domains/video/repository";
import {
  CreateLikeRequestDTO,
  GetLikeStatusRequestDTO,
  GetLikeStatusResposneDTO,
  RemoveLikeRequestDTO,
} from "./type";
import { HTTP_ERRORS } from "../../libraries/error-handling/error-codes";

export const createLike = async (data: CreateLikeRequestDTO): Promise<void> => {
  try {
    const isPublished = await videoRepository.checkPublishedVideoById(
      data.videoId
    );

    if (isPublished === false) {
      throw new AppError(
        HTTP_ERRORS.NotFound.name,
        `Video unavailable`,
        HTTP_ERRORS.NotFound.code
      );
    }

    const isAlreadyLiked = await likeRepository.checkLikeStatusByVideoId(
      data.userId,
      data.videoId
    );

    if (isAlreadyLiked === true) {
      throw new AppError(
        HTTP_ERRORS.NotFound.name,
        `Video already liked`,
        HTTP_ERRORS.NotFound.code
      );
    }

    await likeRepository.createLike({
      userId: data.userId,
      videoId: data.videoId,
    });
  } catch (error: any) {
    throw error;
  }
};

export const getLikeStatus = async (
  data: GetLikeStatusRequestDTO
): Promise<GetLikeStatusResposneDTO> => {
  try {
    const likeStatus = (await likeRepository.checkLikeStatusByVideoId(
      data.userId,
      data.videoId
    )) as boolean;

    return {
      videoLikeStatus: likeStatus,
    };
  } catch (error) {
    throw error;
  }
};

export const getLikeCount = async (videoId: number): Promise<number> => {
  try {
    const likeCount = await likeRepository.countLikeByVideoId(videoId);

    return likeCount;
  } catch (error) {
    throw error;
  }
};

export const removeUserLike = async (
  data: RemoveLikeRequestDTO
): Promise<void> => {
  try {
    const isValidLike = await likeRepository.checkUserLikeById(
      data.likeId,
      data.userId
    );

    if (isValidLike === false) {
      throw new AppError(
        HTTP_ERRORS.NotFound.name,
        `Like unavailable`,
        HTTP_ERRORS.NotFound.code
      );
    }

    await likeRepository.removeLikeById(data.likeId);
  } catch (error: any) {
    throw error;
  }
};
