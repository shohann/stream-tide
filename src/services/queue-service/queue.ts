import { Queue } from "bullmq";
import { ALL_EVENTS as QUEUE_EVENTS } from "../../domains/video/constant";
import EventManager from "../../libraries/util/event-manager";
import configs from "../../configs";
import { parseUrl } from "../../libraries/util/parse-url";
import { getConnectionConfig } from "./queue-connection-config";

const eventEmitter = EventManager.getInstance();
const redisConfig = parseUrl(configs.REDIS_URL);

const queues = Object.values(QUEUE_EVENTS).map((queueName: string) => {
  const connection = getConnectionConfig(redisConfig);

  return {
    name: queueName,
    queueObj: new Queue(queueName, { connection }),
  };
});

export const addQueueItem = async (queueName: string, item: any) => {
  const queue = queues.find((q) => q.name === queueName);
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  eventEmitter.emit(`${queueName}`, item);
  await queue.queueObj.add(queueName, item, {
    removeOnComplete: true,
    removeOnFail: false,
  });
};
