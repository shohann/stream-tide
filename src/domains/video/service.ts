import { AppError } from "../../libraries/error-handling/AppError";
import { CreateVideoRequestDTO, UpdateVideoFromEvent } from "./type";
import { v4 as uuidv4 } from "uuid";
import { addQueueItem } from "../../services/queue-service/queue";
import { VIDEO_QUEUE_EVENTS as QUEUE_EVENTS } from "./constant";
import * as repository from "./repository";
const model = "Video";

export const createVideo = async (data: CreateVideoRequestDTO) => {
  try {
    const hlsId = uuidv4();
    const rawVideoPath = data.videoFile.path;

    const createdVideo = await repository.createVideo({
      title: data.title,
      description: data.description,
    });

    await addQueueItem(QUEUE_EVENTS.VIDEO_UPLOADED, {
      hlsId,
      videoId: createdVideo.id,
      path: rawVideoPath,
    });

    return "success";
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

// Only a publish video can be deleted
