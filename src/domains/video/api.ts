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

const model = "Video";

const routes = () => {
  const router = express.Router();
  console.log(`Setting up routes ${model}`);

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
          return next(new Error("Video file required")); // Need fix error
        }

        await service.createVideo({
          ownerId: userId,
          title,
          description,
          videoFile: req.file,
        });

        res.status(201).send("Video has been uploaded successfully");
      } catch (error) {
        console.error("Error in video processing:", error);
        next(error);
      }
    }
  );

  router.get(
    "/published",
    validate(videoListQuery),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const page = parseInt(req.query.page as string);
        const size = parseInt(req.query.size as string);
        const search = req.query.search as string;
        const result = await service.getPublishedVideos({ page, size, search });

        const apiResponse = new ApiResponse(
          200,
          result.data,
          "Video details fetched successfully",
          result.pagination
        );

        res.status(200).json(apiResponse);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/published/:videoId",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const videoId = req.params.videoId;
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
      try {
        const userId = req.user.id;
        const videoId = parseInt(req.params.videoId);
        const title = req.body.title;
        const description = req.body.description;
        const visibility = req.body.visibility;

        await service.updateOwnVideo({
          id: videoId,
          userId,
          title,
          description,
          visibility,
        });

        res.status(201).send("Success");
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
        res.status(200).send(details);
      } catch (error) {
        console.error("Error in video deleting:", error);
        next(error);
      }
    }
  );

  router.delete(
    "/:videoId",
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const videoId = parseInt(req.params.videoId);
        const userId = req.user.id;
        await service.deleteVideoById(videoId, userId);

        res.status(200).send("Success");
      } catch (error) {
        console.error("Error in video deleting:", error);
        next(error);
      }
    }
  );

  router.put(
    "/:videoId/make-private",
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user.id;
        const videoId = parseInt(req.params.videoId as string);
        await service.makeVideoPrivate(userId, videoId);

        res.status(201).send("Success");
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/:videoId/make-public",
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user.id;
        const videoId = parseInt(req.params.videoId as string);
        await service.makeVideoPublic(userId, videoId);

        res.status(201).send("Success");
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};

export default routes;
