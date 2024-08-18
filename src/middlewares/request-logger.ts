import { Request, Response, NextFunction } from "express";
import logger from "../libraries/log/logger";

export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
};
