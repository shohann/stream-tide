import { AppError } from "../../libraries/error-handling/AppError";
import { HTTP_ERRORS } from "../../libraries/error-handling/error-codes";
import {
  CreateVideoRequestDTO,
  GetOwnVideoDetails,
  GetPublishedVideoDetailsDTO,
  PublishedVideoListResponseDTO,
  PublishedVideosRequestDTO,
  UpdateOwnVideoRequestDTO,
  UpdateVideoFromEvent,
} from "./type";
import { v4 as uuidv4 } from "uuid";
import { addQueueItem } from "../../services/queue-service/queue";
import { VIDEO_QUEUE_EVENTS as QUEUE_EVENTS } from "./constant";
import * as repository from "./repository";
import {
  deleteFolder,
  uploadToCloudinary,
} from "../../libraries/cloudinary/upload-file";
import { calculatePagination, Pagination } from "../../libraries/util/response";
import fsPromise from "fs/promises";

enum VIDEO_VISIBILITIES {
  PUBLIC = "Public",
  PRIVATE = "Private",
  UNLISTED = "Unlisted",
}

const model = "Video";

export const getPublishedVideos = async (
  data: PublishedVideosRequestDTO
): Promise<PublishedVideoListResponseDTO> => {
  try {
    if (!data.page && !data.size) {
      data.page = 1;
      data.size = 10;
    }

    const videos = await repository.getPublishedVideos(data.page, data.size);
    const totalItems = await repository.getPublishedVideosCount();
    const pagination = calculatePagination(data.page, data.size, totalItems);

    return {
      data: videos,
      pagination,
    };
  } catch (error) {
    throw error;
  }
};

export const makeVideoPrivate = async (userId: number, videoId: number) => {
  try {
    const validVideo = await repository.getVideoDetails(videoId);

    if (!validVideo) {
      throw new AppError(
        `${model}: Video unavailable`,
        `${model}: Video unavailable`,
        404
      );
    }

    if (validVideo.ownerId !== userId) {
      throw new AppError(
        `${model}: You do not have permission to access this resource`,
        `${model}: You do not have permission to access this resource`,
        403
      );
    }

    if (validVideo.visibility === "Private") {
      throw new AppError(
        `${model}: Video is already private`,
        `${model}: Video is already private`,
        400
      );
    }

    await repository.updateVisiblityById(videoId, VIDEO_VISIBILITIES.PRIVATE);
  } catch (error) {
    throw error;
  }
};

export const makeVideoPublic = async (userId: number, videoId: number) => {
  try {
    const validVideo = await repository.getVideoDetails(videoId);

    if (!validVideo) {
      throw new AppError(
        `${model}: Video unavailable`,
        `${model}: Video unavailable`,
        404
      );
    }

    if (validVideo.ownerId !== userId) {
      throw new AppError(
        `${model}: You do not have permission to access this resource`,
        `${model}: You do not have permission to access this resource`,
        403
      );
    }

    if (validVideo.visibility === "Public") {
      throw new AppError(
        `${model}: Video is already public`,
        `${model}: Video is already public`,
        400
      );
    }

    await repository.updateVisiblityById(videoId, VIDEO_VISIBILITIES.PUBLIC);
  } catch (error) {
    throw error;
  }
};

export const getVideoDatails = async (
  videoId: number,
  userId: number
): Promise<GetOwnVideoDetails> => {
  try {
    const details = await repository.getVideoDetails(videoId);

    if (!details) {
      throw new AppError(
        `${model}: Video unavailable`,
        `${model}: Video unavailable`,
        404
      );
    }

    if (details.ownerId !== userId) {
      throw new AppError(
        `${model}: You do not have permission to access this resource`,
        `${model}: You do not have permission to access this resource`,
        403
      );
    }

    return details;
  } catch (error) {
    throw error;
  }
};

export const getPublishedVideoDetails = async (
  videoId: number
): Promise<GetPublishedVideoDetailsDTO> => {
  try {
    const validVideo = await repository.getPublishedVideoDetails(videoId);
    if (!validVideo) {
      throw new AppError(
        `${model}: Video unavailable`,
        `${model}: Video unavailable`,
        404
      );
    }

    await repository.updateViewCount(videoId);

    return validVideo;
  } catch (error) {
    throw error;
  }
};

export const createVideo = async (
  data: CreateVideoRequestDTO
): Promise<void> => {
  try {
    const cloudFolderId = uuidv4();
    const rawVideoPath = data.videoFile.path;

    console.log(rawVideoPath);

    const rawVideoURL = await uploadToCloudinary(rawVideoPath, cloudFolderId);
    // await fsPromise.access(rawVideoPath);

    const createdVideo = await repository.createVideo({
      ownerId: data.ownerId,
      title: data.title,
      description: data.description,
      rawVideoUrl: rawVideoURL,
      cloudFolderId: cloudFolderId,
    });

    await addQueueItem(QUEUE_EVENTS.VIDEO_UPLOADED, {
      hlsId: cloudFolderId,
      videoId: createdVideo.id,
      rawVideoURL,
    });

    await fsPromise.unlink(rawVideoPath);
  } catch (error: any) {
    console.error(`create(): Failed to create ${model}`, error);
    throw error;
  }
};

export const updateVideoById = async () => {
  try {
  } catch (error: any) {
    console.error(`updateById(): Failed to create ${model}`, error);
    throw error;
  }
};

export const deleteVideoById = async (
  id: number,
  userId: number
): Promise<void> => {
  try {
    const validVideo = await repository.checkOwnVideoByIdAndReturn(id);

    if (!validVideo || !validVideo.folderId) {
      throw new AppError(
        HTTP_ERRORS.NotFound.name,
        `Video unavailable`,
        HTTP_ERRORS.NotFound.code
      );
    }

    if (validVideo.userId !== userId) {
      throw new AppError(
        `${model}: You do not have permission to access this resource`,
        `${model}: You do not have permission to access this resource`,
        401
      );
    }

    await deleteFolder(validVideo.folderId);
    await repository.deleteVideoById(id);
  } catch (error) {
    throw error;
  }
};

export const updateVideoFromEvent = async (data: UpdateVideoFromEvent) => {
  try {
    await repository.updateVideoAndReturn({
      id: data.id,
      status: data.status,
      rawVideoUrl: data.rawVideoUrl,
      mp4VideoUrl: data.mp4VideoUrl,
      hlsVideoUrl: data.hlsVideoUrl,
      thumbnailUrl: data.thumbnailUrl,
      cloudFolderId: data.cloudFolderId,
      visibility: data.visibility,
    });
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export const updateOwnVideo = async (
  data: UpdateOwnVideoRequestDTO
): Promise<void> => {
  try {
    const validVideo = await repository.checkVideoExistanceAndOwnership(
      data.id,
      data.userId
    );

    if (validVideo.isPublished === false) {
      throw new AppError(
        `${model}: Video unavailable`,
        `${model}: Video unavailable`,
        404
      );
    }

    if (!validVideo.isOwner === false) {
      throw new AppError(
        `${model}: You do not have permission to access this resource`,
        `${model}: You do not have permission to access this resource`,
        401
      );
    }

    await repository.updateVideoAndReturn({
      id: data.id,
      title: data.title,
      description: data.description,
      visibility: data.visibility,
    });
  } catch (error) {
    throw error;
  }
};
