import { VIDEO_QUEUE_EVENTS as QUEUE_EVENTS, NOTIFY_EVENTS } from "./constant";
import {
  processRawFileToMp4,
  processMp4ToHls,
  generateThumbnail,
} from "./video-processor";
import { addQueueItem } from "../../services/queue-service/queue";
import EventManager from "../../libraries/util/event-manager";
import fs from "fs";
import fsPromise from "fs/promises";
import path from "path";
import { downloadFileFromCloudinary } from "../../libraries/cloudinary/download-from-cloudinary";
import { updateM3U8File } from "../../libraries/cloudinary/update-m3u8-file";
import logger from "../../libraries/log/logger";
import { Job } from "bullmq";

const eventEmitter = EventManager.getInstance();

const uploadedHandler = async (job: Job) => {
  logger.info("uploaded handler!", job.data.path);

  await addQueueItem(QUEUE_EVENTS.VIDEO_PROCESSING, {
    ...job.data,
    completed: true,
  });
};

const processingHandler = async (job: Job) => {
  logger.info("processing handler!", job.data.path);

  const rawLocalPath = await downloadFileFromCloudinary(
    job.data.rawVideoURL,
    "./uploads/videos"
  );
  await processRawFileToMp4(`${rawLocalPath}`, `./uploads/processed`, {
    ...job.data,
    completed: true,
    next: QUEUE_EVENTS.VIDEO_PROCESSED,
  });
};

const processedHandler = async (job: Job) => {
  logger.info("processed handler!", job.data.path);
  console.log("Processed Hanlder a ");
  await addQueueItem(QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATING, {
    ...job.data,
    completed: true,
    next: QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATING,
  });
};

const thumbnailGeneratingHandler = async (job: Job) => {
  const processedLocalPath = await downloadFileFromCloudinary(
    job.data.processedCloudURL,
    "./uploads/processed"
  );
  await generateThumbnail(processedLocalPath, "./uploads/thumbnails", {
    ...job.data,
    completed: true,
  });
};

const thumbnailGeneratedHandler = async (job: Job) => {
  await addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTING, {
    ...job.data,
    completed: true,
    next: QUEUE_EVENTS.VIDEO_HLS_CONVERTING,
  });
};

const hlsConvertingHandler = async (job: Job) => {
  logger.info("HLS converting handler!", job.data.path);
  const hlsFolderId = job.data.hlsId;
  fs.mkdirSync(`./uploads/hls/${hlsFolderId}`, { recursive: true });

  const processedLocalPath = await downloadFileFromCloudinary(
    job.data.processedCloudURL,
    "./uploads/processed"
  );

  const hlsConverted = await processMp4ToHls(
    processedLocalPath,
    `./uploads/hls/${hlsFolderId}`,
    {
      ...job.data,
      completed: true,
      next: QUEUE_EVENTS.VIDEO_HLS_CONVERTED,
    }
  );

  const m3u8Path = path.join(
    "uploads",
    "hls",
    hlsFolderId,
    `${path.basename(hlsConverted, path.extname(hlsConverted))}.m3u8`
  );

  const tsFiles = fs
    .readdirSync(`./uploads/hls/${hlsFolderId}`)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => path.join("uploads", "hls", hlsFolderId, file));

  let cloudinaryM3U8Url: string | undefined;
  try {
    cloudinaryM3U8Url = await updateM3U8File(m3u8Path, tsFiles, hlsFolderId);
  } catch (error) {
    logger.error("Error updating and uploading M3U8 file:", error);
    cloudinaryM3U8Url = m3u8Path;
  }

  await addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTED, {
    ...job.data,
    cloudinaryM3U8Url,
  });

  await fsPromise.unlink(processedLocalPath);
  await fsPromise.rm(`./uploads/hls/${hlsFolderId}`, {
    recursive: true,
    force: true,
  });

  logger.info("hlsConverted", hlsConverted);
};

const hlsConvertedHandler = async (job: Job) => {
  logger.info("hls converted handler!", job.data.path);
  await addQueueItem(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED, {
    ...job.data,
    completed: true,
    next: NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED,
  });
};

const notifyVideoHlsConvertedHandler = async (job: Job) => {
  logger.info("notifyVideoHlsConvertedHandler last", job.data.hlsId);
  eventEmitter.emit(`${NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED}`, job.data);
  return { ...job.data, completed: true, next: null };
};

export const QUEUE_EVENT_HANDLERS = {
  [QUEUE_EVENTS.VIDEO_UPLOADED]: uploadedHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSING]: processingHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSED]: processedHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTING]: hlsConvertingHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTED]: hlsConvertedHandler,
  [NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED]: notifyVideoHlsConvertedHandler,
  [QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED]: thumbnailGeneratedHandler,
  [QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATING]: thumbnailGeneratingHandler,
};
