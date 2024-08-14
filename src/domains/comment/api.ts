import express, { Request, Response, NextFunction } from "express";
import * as service from "./service";
import validate, { validateParams } from "../../middlewares/validateResource";
import {
  createComment,
  createCommentType,
  updateComment,
  updateCommentType,
  updateCommentParams,
  updateCommentParamsType,
} from "./request";
import { authorize } from "../../middlewares/auth";

const model = "Comment";

const routes = () => {
  const router = express.Router();
  console.log(`Setting up routes ${model}`);

  router.post(
    "/",
    authorize,
    validate(createComment),
    async (
      req: Request<{}, {}, createCommentType>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const userId = req.user.id;
        const { videoId, content } = req.body;
        await service.createComment({
          userId,
          videoId,
          content,
        });
        res.status(201).send("Success");
      } catch (error: any) {
        next(error);
      }
    }
  );

  // TODO: List api, pagination, search, filtering, sorting, public API
  router.get(
    "/videos/:videoId",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const videoId = req.params.videoId;
        const comments = await service.getCommentList(parseInt(videoId));

        res.status(200).send(comments);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    "/:commentId",
    authorize,
    validate(updateComment),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user.id;
        const commentId = req.params.commentId;

        await service.removeComment(parseInt(commentId), userId);

        res.status(200).send("Success");
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/:commentId",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const commentId = req.params.commentId;

        const commentDetails = await service.getCommentDetails(
          parseInt(commentId)
        );

        res.status(200).send(commentDetails);
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/:commentId",
    authorize,
    validateParams(updateCommentParams),
    async (
      req: Request<updateCommentParamsType, {}, updateCommentType>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const userId = req.user.id;
        const commentId = parseInt(req.params.commentId, 10);
        const content = req.body.content;

        await service.updateComment({
          userId,
          commentId,
          content,
        });

        res.status(201).send("Success");
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};

export default routes;
