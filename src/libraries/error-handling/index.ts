import util from "util";
import { AppError } from "./AppError";
import { Server } from "http";

let httpServerRef: Server | undefined;

const errorHandler = {
  listenToErrorEvents: (httpServer: Server): void => {
    httpServerRef = httpServer;
    process.on("uncaughtException", async (error: Error) => {
      await errorHandler.handleError(error);
    });
    process.on("unhandledRejection", async (reason: any) => {
      await errorHandler.handleError(reason);
    });
    process.on("SIGTERM", async () => {
      console.error(
        "App received SIGTERM event, try to gracefully close the server"
      );
      await terminateHttpServerAndExit();
    });
    process.on("SIGINT", async () => {
      console.error(
        "App received SIGINT event, try to gracefully close the server"
      );
      await terminateHttpServerAndExit();
    });
  },
  handleError: async (errorToHandle: any): Promise<void> => {
    try {
      const appError = normalizeError(errorToHandle);
      console.error(appError.message, appError);
      if (!appError.isTrusted) {
        await terminateHttpServerAndExit();
      }
    } catch (handlingError) {
      // No logger here since it might have failed
      process.stdout.write(
        "The error handler failed. Here are the handler failure and then the origin error that it tried to handle: "
      );
      process.stdout.write(JSON.stringify(handlingError));
      process.stdout.write(JSON.stringify(errorToHandle));
    }
  },
};

const terminateHttpServerAndExit = async (): Promise<void> => {
  if (httpServerRef) {
    await new Promise<void>((resolve) => httpServerRef!.close(() => resolve())); // Graceful shutdown
  }
  process.exit();
};

// The input might won't be 'AppError' or even 'Error' instance, the output of this function will be - AppError.
const normalizeError = (errorToHandle: any): AppError => {
  if (errorToHandle instanceof AppError) {
    return errorToHandle;
  }
  if (errorToHandle instanceof Error) {
    const appError = new AppError(errorToHandle.name, errorToHandle.message);
    appError.stack = errorToHandle.stack;
    return appError;
  }
  const inputType = typeof errorToHandle;
  return new AppError(
    "general-error",
    `Error Handler received a none error instance with type - ${inputType}, value - ${util.inspect(
      errorToHandle
    )}`
  );
};

export { errorHandler };
