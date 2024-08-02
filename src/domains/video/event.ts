import EventManager from "../../libraries/util/event-manager";
import { VIDEO_QUEUE_EVENTS, NOTIFY_EVENTS } from "./constant";
import { updateVideoFromEvent } from "./service";

const eventEmitter = EventManager.getInstance();

// TODO: VIDEO_VISIBILITIES is unused
const VIDEO_VISIBILITIES = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  UNLISTED: "Unlisted",
};

enum VIDEO_STATUS {
  PENDING = "pending",
  PROCESSED = "processed",
  PUBLISHED = "published",
}

export const setup = () => {
  Object.values(VIDEO_QUEUE_EVENTS).forEach((eventName: string) => {
    eventEmitter.on(eventName, async (data: any) => {
      if (eventName === VIDEO_QUEUE_EVENTS.VIDEO_PROCESSED) {
        const videoId = data.videoId;
        const processedCloudURL = data.processedCloudURL;
        await updateVideoFromEvent({
          id: videoId,
          mp4VideoUrl: processedCloudURL,
        });
        return;
      }

      if (eventName === VIDEO_QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED) {
        const videoId = data.videoId;
        const thumbnailURL = data.thumbnailCloudURL;
        await updateVideoFromEvent({
          id: videoId,
          thumbnailUrl: thumbnailURL,
          status: VIDEO_STATUS.PROCESSED,
        });
        return;
      }

      if (eventName === VIDEO_QUEUE_EVENTS.VIDEO_HLS_CONVERTED) {
        const videoId = data.videoId;
        const cloudinaryM3U8Url = data.cloudinaryM3U8Url;
        await updateVideoFromEvent({
          id: videoId,
          hlsVideoUrl: cloudinaryM3U8Url,
          status: VIDEO_STATUS.PUBLISHED,
        });
        return;
      }
    });
  });
};
