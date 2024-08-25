import express, { Application, Request, Response, NextFunction } from "express";
import config from "./configs";
import { Server, createServer } from "http";
import defineRoutes from "./app";
import { errorHandler } from "./libraries/error-handling";
import {
  corsMiddleware,
  customHeadersMiddleware,
} from "./middlewares/cors-middleware";
import { requestLogger } from "./middlewares/request-logger";
import { listenQueueEvent } from "./services/queue-service/worker";
import { NOTIFY_EVENTS } from "./domains/video/constant";
import EventManager from "./libraries/util/event-manager";
import fs from "fs";
import path from "path";
import logger from "./libraries/log/logger";
import { setupSocketEvents, sendNotification } from "./services/socketService";
import { Server as SocketServer } from "socket.io";

const uploadDir = path.join(__dirname, "../uploads");
const eventEmitter = EventManager.getInstance();

let connection: Server;
let ioInstance: SocketServer;

const setup = async () => {
  listenQueueEvent(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED);

  eventEmitter.on(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED, (data: any) => {
    const userId = data.userId.toString();

    sendNotification(
      ioInstance,
      userId,
      `Your video has been successfully transcoded`
    );
  });
};

const createExpressApp = (): Application => {
  const expressApp: Application = express();

  expressApp.use(corsMiddleware);
  expressApp.use(customHeadersMiddleware);
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use("/uploads", express.static("uploads"));
  expressApp.use(requestLogger);
  logger.info("Express middlewares are set up");

  createUploadDirs(uploadDir);
  defineRoutes(expressApp);
  defineErrorHandlingMiddleware(expressApp);

  return expressApp;
};

async function startWebServer(): Promise<Application> {
  logger.info("Starting web server...");

  // Queue setup
  await setup();

  const expressApp = createExpressApp();
  const APIAddress = await openConnection(expressApp);

  logger.info(
    `Server using logger is running on ${APIAddress.address}:${APIAddress.port}`
  );

  return expressApp;
}

async function stopWebServer(): Promise<void> {
  return new Promise((resolve) => {
    if (connection !== undefined) {
      connection.close(() => {
        resolve();
      });
    }
  });
}

function addSocketWithExpressApp(expressApp: Application): {
  io: SocketServer;
  server: Server;
} {
  const server = createServer(expressApp);
  const io = new SocketServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  setupSocketEvents(io);

  return {
    io: io,
    server: server,
  };
}

async function openConnection(
  expressApp: Application
): Promise<{ address: string; port: number }> {
  return new Promise((resolve) => {
    const webServerPort = config.PORT;
    logger.info(`Server is about to listen to port ${webServerPort}`);

    const { io, server } = addSocketWithExpressApp(expressApp);
    ioInstance = io;

    connection = server.listen(webServerPort, () => {
      errorHandler.listenToErrorEvents(connection);
      resolve(server.address() as { address: string; port: number });
    });
  });
}

function defineErrorHandlingMiddleware(expressApp: Application): void {
  expressApp.use(
    async (error: any, req: Request, res: Response, next: NextFunction) => {
      // Note: next is required for Express error handlers

      if (error && typeof error === "object") {
        if (error.isTrusted === undefined || error.isTrusted === null) {
          error.isTrusted = true;
        }
      }

      await errorHandler.handleError(error);

      res.status(error?.HTTPStatus || 500).json({
        message: error?.message ? error?.message : "Internal Server Error",
      });
    }
  );
}

function createUploadDirs(baseDir: string): void {
  const requiredDirs = ["hls", "processed", "thumbnails", "videos"];

  requiredDirs.forEach((dir) => {
    const dirPath = path.join(baseDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.info(`Created directory: ${dirPath}`);
    }
  });
}

export { createExpressApp, startWebServer, stopWebServer, createUploadDirs };
