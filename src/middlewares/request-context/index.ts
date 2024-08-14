import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

const requestContextStore = new AsyncLocalStorage<Map<string, any>>();
const REQUEST_ID_HEADER_NAME = "x-request-id";

const generateRequestId = (): string => randomUUID();

export const addRequestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const existingRequestId = req.headers[REQUEST_ID_HEADER_NAME] as
    | string
    | undefined;
  const requestId = existingRequestId || generateRequestId();

  res.setHeader(REQUEST_ID_HEADER_NAME, requestId);

  requestContextStore.run(new Map(), () => {
    requestContextStore.getStore()?.set("requestId", requestId);
    next();
  });
};

export const retrieveRequestId = (): string | undefined => {
  return requestContextStore.getStore()?.get("requestId");
};
