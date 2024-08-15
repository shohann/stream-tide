import { Worker, QueueEvents, Job } from "bullmq";
import { VIDEO_QUEUE_EVENTS } from "../../domains/video/constant";
import { QUEUE_EVENT_HANDLERS } from "../../domains/video/job";
import { setup as setupVideoHandler } from "../../domains/video/event";
import logger from "../../libraries/log/logger";

interface RedisConnection {
  host: string;
  port: number;
}

const redisConnection: RedisConnection = {
  host: "localhost",
  port: 6379,
};

export const listenQueueEvent = (queueName: string) => {
  const queueEvents = new QueueEvents(queueName, {
    connection: redisConnection,
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    logger.info(`${jobId} has failed with reason ${failedReason}`);
  });

  const worker = new Worker(
    queueName,
    async (job: Job) => {
      const handler = QUEUE_EVENT_HANDLERS[queueName];
      if (handler) {
        return await handler(job);
      }
      throw new Error("No handler found for queue: " + queueName);
    },
    { connection: redisConnection }
  );

  worker.on("completed", (job: Job) => {
    logger.info(`${job.id} has completed!`);
  });

  worker.on("failed", (job: any, err: Error) => {
    logger.error(`${job.id} has failed with ${err.message}`);
  });

  logger.info(queueName, " worker started", new Date().toTimeString());
};

export const setupAllQueueEvents = () => {
  Object.values(VIDEO_QUEUE_EVENTS).map((queueName: string) =>
    listenQueueEvent(queueName)
  );

  setupVideoHandler();
  return true;
};
