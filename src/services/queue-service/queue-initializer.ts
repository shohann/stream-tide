import path from "path";
import { setupAllQueueEvents } from "./worker";
import { createUploadDirs } from "../../server";

const uploadDir = path.join(__dirname, "../../../uploads");

const setup = async () => {
  createUploadDirs(uploadDir);
  const status = setupAllQueueEvents();
  console.log("setupAllQueueEvents: ", status);
};

setup();
