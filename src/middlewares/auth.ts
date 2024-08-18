import { Request, Response, NextFunction } from "express";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { verifyToken, getToken } from "../libraries/util/jwt";
import { AppError } from "../libraries/error-handling/AppError";
import { HTTP_ERRORS } from "../libraries/error-handling/error-codes";

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorizationHeader = req.headers["authorization"];

    if (!authorizationHeader) {
      throw new AppError(
        HTTP_ERRORS.Unauthorized.name,
        "Authorization header is missing",
        HTTP_ERRORS.Unauthorized.code
      );
    }

    const token = getToken(authorizationHeader);
    const decode = verifyToken(token);
    req.user = decode;

    next();
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      throw new AppError(
        HTTP_ERRORS.Unauthorized.name,
        "Token expired",
        HTTP_ERRORS.Unauthorized.code
      );
    }

    if (error instanceof JsonWebTokenError) {
      throw new AppError(
        HTTP_ERRORS.Unauthorized.name,
        "Invalid token",
        HTTP_ERRORS.Unauthorized.code
      );
    }

    next(error);
  }
};

export const checkAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user && req.user.role === "admin") {
      return next();
    } else {
      throw new AppError(
        HTTP_ERRORS.Forbidden.name,
        "Invalid token",
        HTTP_ERRORS.Forbidden.code
      );
    }
  } catch (error) {
    next(error);
  }
};
