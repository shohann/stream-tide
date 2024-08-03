import { AppError } from "../../libraries/error-handling/AppError";
import {
  CreateVideoLikeRequestDTO,
  CreateVideoRequestDTO,
  UpdateVideoFromEvent,
} from "./type";
import { v4 as uuidv4 } from "uuid";
import { addQueueItem } from "../../services/queue-service/queue";
import { VIDEO_QUEUE_EVENTS as QUEUE_EVENTS } from "./constant";
import * as repository from "./repository";
import { uploadToCloudinary } from "../../libraries/cloudinary/upload-file";

const model = "Video";

export const createVideo = async (
  data: CreateVideoRequestDTO
): Promise<void> => {
  try {
    const cloudFolderId = uuidv4();
    const rawVideoPath = data.videoFile.path;

    const rawVideoURL = await uploadToCloudinary(rawVideoPath, cloudFolderId);

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

// TODO: Check ownership by ueer id
export const deleteVideoById = async (id: number): Promise<void> => {
  try {
    const isPublished = await repository.checkPublishedVideoById(id);

    if (isPublished === false) {
      throw new AppError(
        `${model}: Video unavailable`,
        `${model}: Video unavailable`,
        404
      );
    }

    await repository.deleteVideoById(id);
  } catch (error) {
    console.error(`deleteVideoById(): Failed to create ${model}`, error);
    throw error;
  }
};

// TODO: Error handling from event
// TODO: Returning data or not returning
// TODO: What about visiblity
export const updateVideoFromEvent = async (data: UpdateVideoFromEvent) => {
  try {
    await repository.updateVideo({
      id: data.id,
      status: data.status,
      rawVideoUrl: data.rawVideoUrl,
      mp4VideoUrl: data.mp4VideoUrl,
      hlsVideoUrl: data.hlsVideoUrl,
      thumbnailUrl: data.thumbnailUrl,
      cloudFolderId: data.cloudFolderId,
    });
  } catch (error) {
    console.log(error);

    throw error;
  }
};
