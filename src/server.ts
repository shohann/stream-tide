import express, { Application, Request, Response, NextFunction } from "express";
import config from "./configs";
import { Server } from "http";
import defineRoutes from "./app";
import { errorHandler } from "./libraries/error-handling";
import {
  corsMiddleware,
  customHeadersMiddleware,
} from "./middlewares/cors-middleware";
import { requestLogger } from "./middlewares/request-logger";

///
import { listenQueueEvent } from "./services/queue-service/worker";
import { NOTIFY_EVENTS } from "./domains/video/constant";
import EventManager from "./libraries/util/event-manager";
const eventEmitter = EventManager.getInstance();

const setup = async () => {
  listenQueueEvent(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED);

  eventEmitter.on(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED, (data: any) => {
    console.log("NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED Event handler", data);
    // io.emit("hello", data);
  });
};
///

let connection: Server;

const createExpressApp = (): Application => {
  const expressApp: Application = express();

  expressApp.use(corsMiddleware);
  expressApp.use(customHeadersMiddleware);
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use("/uploads", express.static("uploads"));

  expressApp.use(requestLogger);

  console.log("Express middlewares are set up");
  defineRoutes(expressApp);
  defineErrorHandlingMiddleware(expressApp);
  return expressApp;
};

async function startWebServer(): Promise<Application> {
  console.log("Starting web server...");

  await setup(); // Queue setup

  const expressApp = createExpressApp();
  const APIAddress = await openConnection(expressApp);
  console.log(`Server is running on ${APIAddress.address}:${APIAddress.port}`);

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

async function openConnection(
  expressApp: Application
): Promise<{ address: string; port: number }> {
  return new Promise((resolve) => {
    const webServerPort = config.PORT;
    console.log(`Server is about to listen to port ${webServerPort}`);

    connection = expressApp.listen(webServerPort, () => {
      errorHandler.listenToErrorEvents(connection);
      resolve(connection.address() as { address: string; port: number });
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
      // res.status(error?.HTTPStatus || 500).end();
      res.status(error?.HTTPStatus || 500).json({
        message: error?.message ? error?.message : "Internal Server Error",
      });
    }
  );
}

export { createExpressApp, startWebServer, stopWebServer };
