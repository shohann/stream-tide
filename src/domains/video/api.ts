import express, { Request, Response, NextFunction } from "express";
import upload from "../../libraries/util/upload";
import { createVideo, createVideoBody } from "./request";
import * as service from "./service";
import validate, {
  validateAndParse,
  validateParams,
} from "../../middlewares/validateResource";
import { authorize } from "../../middlewares/auth";

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
          return next(new Error("Video file required"));
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

  router.delete(
    "/:videoId",
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      const videoId = parseInt(req.params.videoId);

      try {
        await service.deleteVideoById(videoId);
        res.status(200).send("Success");
      } catch (error) {
        console.error("Error in video deleting:", error);
        next(error);
      }
    }
  );

  // Get video details

  // Get video list

  // Search video

  // Update video

  return router;
};

export default routes;
