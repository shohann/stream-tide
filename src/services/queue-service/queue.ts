import { Queue } from "bullmq";
import { ALL_EVENTS as QUEUE_EVENTS } from "../../domains/video/constant";
import EventManager from "../../libraries/util/event-manager";

const eventEmitter = EventManager.getInstance();

interface RedisConnection {
  host: string;
  port: number;
}

const redisConnection: RedisConnection = {
  host: "localhost",
  port: 6379,
};

const queues = Object.values(QUEUE_EVENTS).map((queueName: string) => {
  return {
    name: queueName,
    queueObj: new Queue(queueName, { connection: redisConnection }),
  };
});

export const addQueueItem = async (queueName: string, item: any) => {
  const queue = queues.find((q) => q.name === queueName);
  if (!queue) {
    throw new Error(`queue ${queueName} not found`);
  }

  eventEmitter.emit(`${queueName}`, item);
  await queue.queueObj.add(queueName, item, {
    removeOnComplete: true,
    removeOnFail: false,
  });
};
