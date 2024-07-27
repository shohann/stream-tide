import { VIDEO_QUEUE_EVENTS as QUEUE_EVENTS, NOTIFY_EVENTS } from "./constants";
import { processRawFileToMp4, processMp4ToHls } from "./video-processor";
import { addQueueItem } from "./queues";
import EventManager from "./event-manager";

const eventEmitter = EventManager.getInstance();

const uploadedHandler = async (job: any) => {
  console.log("uploaded handler!", job.data.path);
  await addQueueItem(QUEUE_EVENTS.VIDEO_PROCESSING, {
    ...job.data,
    completed: true,
  });
  return;
};

const processingHandler = async (job: any) => {
  console.log("processing handler!", job.data.path);
  await processRawFileToMp4(`./${job.data.path}`, `./uploads/processed`, {
    ...job.data,
    completed: true,
    next: QUEUE_EVENTS.VIDEO_PROCESSED,
  });
  return;
};

const processedHandler = async (job: any) => {
  console.log("processed handler!", job.data.path);
  await addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTING, {
    ...job.data,
    completed: true,
    next: QUEUE_EVENTS.VIDEO_HLS_CONVERTING,
  });
  return;
};

const hlsConvertingHandler = async (job: any) => {
  console.log("HLS converting handler!", job.data.path);
  const hlsConverted = await processMp4ToHls(
    `./${job.data.path}`,
    `./uploads/hls`,
    {
      ...job.data,
      completed: true,
      next: QUEUE_EVENTS.VIDEO_HLS_CONVERTED,
    }
  );
  console.log("hlsConverted", hlsConverted);
  return;
};

const hlsConvertedHandler = async (job: any) => {
  console.log("hls converted handler!", job.data.path);
  await addQueueItem(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED, {
    ...job.data,
    completed: true,
    next: null,
  });
  return;
};

const notifyVideoHlsConvertedHandler = async (job: any) => {
  console.log("VIDEO_THUMBNAIL_GENERATED handler!", job.data);
  eventEmitter.emit(`${NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED}`, job.data);
  return { ...job.data, completed: true, next: null };
};

const thumbnailGeneratedHandler = async (job: any) => {
  console.log("videoThumbnailGenerated handler!", job.data.path);

  return;
};

const QUEUE_EVENT_HANDLERS = {
  [QUEUE_EVENTS.VIDEO_UPLOADED]: uploadedHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSING]: processingHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSED]: processedHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTING]: hlsConvertingHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTED]: hlsConvertedHandler,
  [NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED]: notifyVideoHlsConvertedHandler,
  [QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED]: thumbnailGeneratedHandler,
};

export { QUEUE_EVENT_HANDLERS };
