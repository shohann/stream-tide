import path from "path";
import { setupAllQueueEvents } from "./worker";
import { createUploadDirs } from "../../server";
import http from "http";

const uploadDir = path.join(__dirname, "../../../uploads");

const setup = async () => {
  createUploadDirs(uploadDir);
  const status = setupAllQueueEvents();
  console.log("setupAllQueueEvents: ", status);

  ///
  const server = http.createServer();

  const port = 3000; // You can change this port if needed
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

setup();
