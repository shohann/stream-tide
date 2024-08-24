import express, { Request, Response, NextFunction } from "express";
import upload from "../../libraries/util/upload";
import {
  createVideo,
  createVideoBody,
  updateVideo,
  updateVideoBody,
  updateVideoParamsType,
  videoListQuery,
} from "./request";
import * as service from "./service";
import validate, { validateAndParse } from "../../middlewares/validateResource";
import { authorize } from "../../middlewares/auth";
import ApiResponse from "../../libraries/util/response";
import logger from "../../libraries/log/logger";
import { AppError } from "../../libraries/error-handling/AppError";
import { HTTP_ERRORS } from "../../libraries/error-handling/error-codes";

const routes = () => {
  const router = express.Router();
  logger.info(`Setting up routes video`);

  router.post(
    "/upload",
    authorize,
    upload.single("file"),
    validateAndParse(createVideo),
    async (
      req: Request<{}, {}, createVideoBody>,
      res: Response,
      next: NextFunction
    ) => {
      const { title, description } = req.body;
      const userId = req.user.id;

      try {
        if (!req.file) {
          throw new AppError(
            HTTP_ERRORS.NotFound.name,
            `Video unavailable`,
            HTTP_ERRORS.NotFound.code
          );
        }

        await service.createVideo({
          ownerId: userId,
          title,
          description,
          videoFile: req.file,
        });

        const apiResponse = new ApiResponse(
          201,
          null,
          "Video uploaded successfully"
        );

        res.status(apiResponse.statusCode).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/published",
    validate(videoListQuery),
    async (req: Request, res: Response, next: NextFunction) => {
      const page = parseInt(req.query.page as string);
      const size = parseInt(req.query.size as string);
      const search = req.query.search as string;

      try {
        const result = await service.getPublishedVideos({ page, size, search });

        const apiResponse = new ApiResponse(
          200,
          result.data,
          "Video details fetched successfully",
          result.pagination
        );

        res.status(apiResponse.statusCode).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/published/:videoId",
    async (req: Request, res: Response, next: NextFunction) => {
      const videoId = req.params.videoId;

      try {
        const result = await service.getPublishedVideoDetails(
          parseInt(videoId)
        );

        const apiResponse = new ApiResponse(
          200,
          result,
          "Video details fetched successfully"
        );

        res.status(200).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/published/:videoId",
    authorize,
    validate(updateVideo),
    async (
      req: Request<updateVideoParamsType, {}, updateVideoBody>,
      res: Response,
      next: NextFunction
    ) => {
      const userId = req.user.id;
      const videoId = parseInt(req.params.videoId);
      const title = req.body.title;
      const description = req.body.description;
      const visibility = req.body.visibility;

      try {
        await service.updateOwnVideo({
          id: videoId,
          userId,
          title,
          description,
          visibility,
        });

        const apiResponse = new ApiResponse(
          200,
          null,
          "Video updated successfully"
        );

        res.status(200).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/:videoId",
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      const videoId = parseInt(req.params.videoId);
      const userId = req.user.id;

      try {
        const details = await service.getVideoDatails(videoId, userId);

        const apiResponse = new ApiResponse(
          200,
          details,
          "Video updated successfully"
        );

        res.status(200).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    "/:videoId",
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      const videoId = parseInt(req.params.videoId);
      const userId = req.user.id;

      try {
        await service.deleteVideoById(videoId, userId);

        const apiResponse = new ApiResponse(
          200,
          null,
          "Video deleted successfully"
        );

        res.status(200).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/:videoId/make-private",
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const videoId = parseInt(req.params.videoId as string);

      try {
        await service.makeVideoPrivate(userId, videoId);

        const apiResponse = new ApiResponse(
          200,
          null,
          "Video updated successfully"
        );

        res.status(200).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/:videoId/make-public",
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const videoId = parseInt(req.params.videoId as string);

      try {
        await service.makeVideoPublic(userId, videoId);

        const apiResponse = new ApiResponse(
          200,
          null,
          "Video updated successfully"
        );

        res.status(200).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};

export default routes;
