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
import { VIDEO_VISIBILITIES } from "./type";

export const getPublishedVideos = async (
  data: PublishedVideosRequestDTO
): Promise<PublishedVideoListResponseDTO> => {
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
};

export const makeVideoPrivate = async (userId: number, videoId: number) => {
  const validVideo = await repository.getVideoDetails(videoId);

  if (!validVideo) {
    throw new AppError(
      HTTP_ERRORS.NotFound.name,
      `Video unavailable`,
      HTTP_ERRORS.NotFound.code
    );
  }

  if (validVideo.ownerId !== userId) {
    throw new AppError(
      HTTP_ERRORS.Forbidden.name,
      `You do not have permission to access this resource`,
      HTTP_ERRORS.Forbidden.code
    );
  }

  if (validVideo.visibility === "Private") {
    throw new AppError(
      HTTP_ERRORS.BadRequest.name,
      `Video is already private`,
      HTTP_ERRORS.BadRequest.code
    );
  }

  await repository.updateVisiblityById(videoId, VIDEO_VISIBILITIES.PRIVATE);
};

export const makeVideoPublic = async (userId: number, videoId: number) => {
  const validVideo = await repository.getVideoDetails(videoId);

  if (!validVideo) {
    throw new AppError(
      HTTP_ERRORS.NotFound.name,
      `Video unavailable`,
      HTTP_ERRORS.NotFound.code
    );
  }

  if (validVideo.ownerId !== userId) {
    throw new AppError(
      HTTP_ERRORS.Forbidden.name,
      `You do not have permission to access this resource`,
      HTTP_ERRORS.Forbidden.code
    );
  }

  if (validVideo.visibility === "Public") {
    throw new AppError(
      HTTP_ERRORS.BadRequest.name,
      `Video is already public`,
      HTTP_ERRORS.BadRequest.code
    );
  }

  await repository.updateVisiblityById(videoId, VIDEO_VISIBILITIES.PUBLIC);
};

export const getVideoDatails = async (
  videoId: number,
  userId: number
): Promise<GetOwnVideoDetails> => {
  const details = await repository.getVideoDetails(videoId);

  if (!details) {
    throw new AppError(
      HTTP_ERRORS.NotFound.name,
      `Video unavailable`,
      HTTP_ERRORS.NotFound.code
    );
  }

  if (details.ownerId !== userId) {
    throw new AppError(
      HTTP_ERRORS.Forbidden.name,
      `You do not have permission to access this resource`,
      HTTP_ERRORS.Forbidden.code
    );
  }

  return details;
};

export const getPublishedVideoDetails = async (
  videoId: number
): Promise<GetPublishedVideoDetailsDTO> => {
  const validVideo = await repository.getPublishedVideoDetails(videoId);
  if (!validVideo) {
    throw new AppError(
      HTTP_ERRORS.NotFound.name,
      `Video unavailable`,
      HTTP_ERRORS.NotFound.code
    );
  }

  await repository.updateViewCount(videoId);

  return validVideo;
};

export const createVideo = async (
  data: CreateVideoRequestDTO
): Promise<void> => {
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
};

export const deleteVideoById = async (
  id: number,
  userId: number
): Promise<void> => {
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
      HTTP_ERRORS.Unauthorized.name,
      `You do not have permission to access this resource`,
      HTTP_ERRORS.Unauthorized.code
    );
  }

  await deleteFolder(validVideo.folderId);
  await repository.deleteVideoById(id);
};

export const updateVideoFromEvent = async (data: UpdateVideoFromEvent) => {
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
};

export const updateOwnVideo = async (
  data: UpdateOwnVideoRequestDTO
): Promise<void> => {
  const validVideo = await repository.checkVideoExistanceAndOwnership(
    data.id,
    data.userId
  );

  if (validVideo.isPublished === false) {
    throw new AppError(
      HTTP_ERRORS.NotFound.name,
      `Video unavailable`,
      HTTP_ERRORS.NotFound.code
    );
  }

  if (!validVideo.isOwner === false) {
    throw new AppError(
      HTTP_ERRORS.Forbidden.name,
      `You do not have permission to access this resource`,
      HTTP_ERRORS.Forbidden.code
    );
  }

  await repository.updateVideoAndReturn({
    id: data.id,
    title: data.title,
    description: data.description,
    visibility: data.visibility,
  });
};
