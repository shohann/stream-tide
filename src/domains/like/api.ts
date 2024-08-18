import express, { Request, Response, NextFunction } from "express";
import * as service from "./service";
import validate from "../../middlewares/validateResource";
import { createLike, createLikeType } from "./request";
import { authorize } from "../../middlewares/auth";
import ApiResponse from "../../libraries/util/response";
import logger from "../../libraries/log/logger";

const routes = () => {
  const router = express.Router();
  logger.info(`Setting up routes Like`);

  router.post(
    "/",
    authorize,
    validate(createLike),
    async (
      req: Request<{}, {}, createLikeType>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const userId = req.user.id;
        const { videoId } = req.body;

        await service.createLike({
          userId,
          videoId,
        });

        const apiResponse = new ApiResponse(
          201,
          null,
          "Like created successfully"
        );

        res.status(apiResponse.statusCode).json(apiResponse);
      } catch (error: any) {
        next(error);
      }
    }
  );

  router.get(
    "/videos/:videoId/like-count",
    async (req: Request, res: Response, next: NextFunction) => {
      const videoId = parseInt(req.params.videoId as string);
      const count = await service.getLikeCount(videoId);

      const apiResponse = new ApiResponse(
        200,
        { count },
        "Like count fetched successfully"
      );

      res.status(apiResponse.statusCode).json(apiResponse);
    }
  );

  router.get(
    "/videos/:videoId/user-like-status",
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user.id;
        const videoId = parseInt(req.params.videoId);

        const status = await service.getLikeStatus({ userId, videoId });

        const apiResponse = new ApiResponse(
          200,
          status,
          "Like fetched successfully"
        );

        res.status(apiResponse.statusCode).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/videos/:videoId/video-like-count",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const videoId = parseInt(req.params.videoId);
        const likeCount = await service.getLikeCount(videoId);

        const apiResponse = new ApiResponse(
          200,
          { likeCount },
          "Like fetched successfully"
        );

        res.status(apiResponse.statusCode).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    "/:likeId",
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      const likeId = parseInt(req.params.likeId);
      const userId = req.user.id;

      await service.removeUserLike({ userId, likeId });

      const apiResponse = new ApiResponse(
        200,
        null,
        "Like deleted successfully"
      );

      res.status(apiResponse.statusCode).json(apiResponse);
    }
  );

  return router;
};

export default routes;
