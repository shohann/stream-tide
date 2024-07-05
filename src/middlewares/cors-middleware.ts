import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

export const corsMiddleware = cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
});

export const customHeadersMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
};