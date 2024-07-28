import { setupAllQueueEvents } from "./worker";

const setup = async () => {
  const status = setupAllQueueEvents();
  console.log("setupAllQueueEvents: ", status);
};

setup();
