import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  // Log an info message for each incoming request
  console.log(`${req.method} ${req.originalUrl}`);
  next();
};