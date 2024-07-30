import EventManager from "../../libraries/util/event-manager";
import { VIDEO_QUEUE_EVENTS, NOTIFY_EVENTS } from "./constant";
import { updateVideoFromEvent } from "./service";

const eventEmitter = EventManager.getInstance();

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
  //   const SERVER_URL = "localhost:4000/api/v1/";

  Object.values(VIDEO_QUEUE_EVENTS).forEach((eventName: string) => {
    eventEmitter.on(eventName, async (data: any) => {
      if (eventName === VIDEO_QUEUE_EVENTS.UPLOADED_RAW_VIDEO) {
        const videoId = data.videoId;
        const rawVideoURL = data.rawVideoURL;
        const hlsId = data.hlsId;

        await updateVideoFromEvent({
          id: videoId,
          rawVideoUrl: rawVideoURL,
          cloudFolderId: hlsId,
        });
        return;
      }

      if (eventName === VIDEO_QUEUE_EVENTS.UPLOADED_PROCESSED_VIDEO) {
        const videoId = data.videoId;
        const processedVideoURL = data.processedVideoURL;

        await updateVideoFromEvent({
          id: videoId,
          mp4VideoUrl: processedVideoURL,
        });

        return;
      }

      if (eventName === VIDEO_QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED_UPLOADED) {
        const videoId = data.videoId;
        const thumbnailURL = data.thumbnailURL;

        await updateVideoFromEvent({
          id: videoId,
          thumbnailUrl: thumbnailURL,
          status: VIDEO_STATUS.PROCESSED,
        });

        return;
      }

      if (eventName === VIDEO_QUEUE_EVENTS.VIDEO_HLS_CONVERTED_UPLOADED) {
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
