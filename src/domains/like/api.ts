import express, { Request, Response, NextFunction } from "express";
import * as service from "./service";
import validate from "../../middlewares/validateResource";
import { createLike, createLikeType } from "./request";
import { authorize } from "../../middlewares/auth";

const model = "Like";

const routes = () => {
  const router = express.Router();
  console.log(`Setting up routes ${model}`);

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

        res.status(201).send("Success");
      } catch (error: any) {
        next(error);
      }
    }
  );

  // Handling already like

  router.get(
    "/videos/:videosId/like-count",
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const videoId = parseInt(req.params.videoId);

      res.status(200).send("OK");
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

        res.status(200).send(status);
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

        res.status(200).send({ likeCount });
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

      res.status(200).send();
    }
  );

  return router;
};

export default routes;
