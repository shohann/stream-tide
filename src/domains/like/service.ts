import { AppError } from "../../libraries/error-handling/AppError";
import * as likeRepository from "./repository";
import * as videoRepository from "../../domains/video/repository";
import {
  CreateLikeRequestDTO,
  GetLikeStatusRequestDTO,
  GetLikeStatusResposneDTO,
  RemoveLikeRequestDTO,
} from "./type";

const model = "Like";

export const createLike = async (data: CreateLikeRequestDTO): Promise<void> => {
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

    const isAlreadyLiked = await likeRepository.checkLikeStatusByVideoId(
      data.userId,
      data.videoId
    );
    if (isAlreadyLiked === true) {
      throw new AppError(
        `${model}: Video already liked`,
        `${model}: Video already liked`,
        400
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
        `${model}: Like unavailable`,
        `${model}: Like unavailable`,
        404
      );
    }

    await likeRepository.removeLikeById(data.likeId);
  } catch (error: any) {
    console.error(`deleteById(): Failed to create ${model}`, error);
    throw error;
  }
};
