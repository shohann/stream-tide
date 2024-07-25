import express, { Request, Response, NextFunction } from "express";
import { verifyToken, getToken } from "../libraries/util/jwt";

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorizationHeader = req.headers["authorization"];

    if (!authorizationHeader) {
      throw new Error("Authorization header is missing");
    }

    const token = getToken(authorizationHeader);
    const decode = verifyToken(token);

    req.user = decode;
    next();
  } catch (error) {
    next(error);
  }
};
