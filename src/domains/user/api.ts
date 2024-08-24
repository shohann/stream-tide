import express, { Request, Response, NextFunction } from "express";
import * as service from "./service";
import {
  registerUserBody,
  userRegister,
  userDetailsParams,
  userLogin,
  loginUserBody,
  userUpdateParams,
  userUpdate,
  userUpdateType,
  userUpdateParamsType,
  refreshAccessToken,
  refreshAccessTokenBody,
} from "./request";
import validate, {
  validateAndParse,
  validateParams,
} from "../../middlewares/validateResource";
import upload from "../../libraries/util/upload";
import { authorize, checkAdmin } from "../../middlewares/auth";
import ApiResponse from "../../libraries/util/response";
import logger from "../../libraries/log/logger";

const model = "User";

const routes = () => {
  const router = express.Router();
  logger.info(`Setting up routes ${model}`);

  router.get(
    "/",
    authorize,
    checkAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const page = parseInt(req.query.page as string);
        const size = parseInt(req.query.size as string);
        const search = req.query.search as string;

        const userList = await service.list({ page, size, search });

        const apiResponse = new ApiResponse(
          200,
          userList.data,
          "User list fetched successfully",
          userList.pagination
        );

        res.status(apiResponse.statusCode).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/register",
    validate(userRegister),
    async (
      req: Request<{}, {}, registerUserBody>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { firstName, lastName, email, userName, password } = req.body;
        const newUser = await service.register({
          firstName,
          lastName,
          email,
          userName,
          password,
        });

        const apiResponse = new ApiResponse(
          200,
          newUser,
          "Registration successful"
        );

        res.status(apiResponse.statusCode).json(newUser);
      } catch (error: any) {
        next(error);
      }
    }
  );

  router.post(
    "/login",
    validate(userLogin),
    async (
      req: Request<{}, {}, loginUserBody>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { email, password } = req.body;
        const result = await service.login({
          email,
          password,
        });

        const apiResponse = new ApiResponse(200, result, "Login successful");

        res.status(apiResponse.statusCode).json(apiResponse);
      } catch (error: any) {
        next(error);
      }
    }
  );

  router.post(
    "/refresh",
    validate(refreshAccessToken),
    async (
      req: Request<{}, {}, refreshAccessTokenBody>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const oldRefreshToken = req.body.refreshToken;
        const tokens = await service.refreshAccessToken(oldRefreshToken);

        const apiResponse = new ApiResponse(200, tokens, "Login successful");

        res.status(apiResponse.statusCode).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    "/logout-all",
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user.id;
        await service.logoutAll(userId);

        const apiResponse = new ApiResponse(200, null, "Logout successful");

        res.status(apiResponse.statusCode).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/:userId",
    validate(userDetailsParams),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = parseInt(req.params.userId, 10);
        const userDetails = await service.details(userId);

        const apiResponse = new ApiResponse(
          200,
          userDetails,
          "Login successful"
        );

        res.status(apiResponse.statusCode).json(apiResponse);
      } catch (error: any) {
        next(error);
      }
    }
  );

  router.put(
    "/:userId",
    authorize,
    validateParams(userUpdateParams),
    upload.single("file"),
    validateAndParse(userUpdate),
    async (
      req: Request<userUpdateParamsType, {}, userUpdateType>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { firstName, lastName, email, userName } = req.body;
        const userId = parseInt(req.params.userId, 10);
        const imageFile = req.file;

        const updatedUser = await service.updateUserProfile({
          userId: userId,
          firstName,
          lastName,
          email,
          userName,
          imageFile: imageFile,
        });

        const apiResponse = new ApiResponse(
          200,
          updatedUser,
          "Update successful"
        );

        res.status(apiResponse.statusCode).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};

export default routes;
