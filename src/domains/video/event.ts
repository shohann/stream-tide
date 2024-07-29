import EventManager from "../../libraries/util/event-manager";
import { VIDEO_QUEUE_EVENTS, NOTIFY_EVENTS } from "./constant";

const eventEmitter = EventManager.getInstance();

const VIDEO_VISIBILITIES = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  UNLISTED: "Unlisted",
};

const VIDEO_STATUS = {
  PENDING: "pending",
  PROCESSED: "processed",
  PUBLISHED: "published",
};

export const setup = () => {
  //   const SERVER_URL = "localhost:4000/api/v1/";

  Object.values(VIDEO_QUEUE_EVENTS).forEach((eventName: string) => {
    eventEmitter.on(eventName, async (data: any) => {
      if (eventName === VIDEO_QUEUE_EVENTS.VIDEO_UPLOADED) {
        console.log(`${eventName} service is processing`);
        // Update the db with link
        return;
      }

      if (eventName === VIDEO_QUEUE_EVENTS.VIDEO_PROCESSED) {
        console.log(`${eventName} service is processing`);
        // Update the db with link
        return;
      }

      if (eventName === VIDEO_QUEUE_EVENTS.VIDEO_HLS_CONVERTED_UPLOADED) {
        // console.log(data);
        // Update the db with link
        // DB state will be Published
        console.log(`${eventName} service is processing`);
        return;
      }

      if (eventName === VIDEO_QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED_UPLOADED) {
        // console.log(data);
        // Whenver we upload the generated thumbnail we will change the status of db into processed
        // Update the db
        console.log(`${eventName} service is processing`);
        return;
      }
    });
  });
};
