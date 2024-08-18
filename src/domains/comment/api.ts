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
import ApiResponse from "../../libraries/util/response";
import logger from "../../libraries/log/logger";

const routes = () => {
  const router = express.Router();
  logger.info(`Setting up routes comments`);

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

        const createdComment = await service.createComment({
          userId,
          videoId,
          content,
        });

        const apiResponse = new ApiResponse(
          201,
          createdComment,
          "Comment created successfully"
        );

        res.status(apiResponse.statusCode).json(apiResponse);
      } catch (error: any) {
        next(error);
      }
    }
  );

  router.get(
    "/videos/:videoId",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const page = parseInt(req.query.page as string);
        const size = parseInt(req.query.size as string);
        const videoId = parseInt(req.params.videoId as string);

        const comments = await service.getCommentList({
          videoId,
          page,
          size,
        });

        const apiResponse = new ApiResponse(
          200,
          comments,
          "Comment fetched successfully"
        );

        res.status(apiResponse.statusCode).json(apiResponse);
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

        const apiResponse = new ApiResponse(
          200,
          null,
          "Comment deleted successfully"
        );

        res.status(apiResponse.statusCode).json(apiResponse);
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

        const apiResponse = new ApiResponse(
          200,
          commentDetails,
          "Comment deleted successfully"
        );

        res.status(apiResponse.statusCode).json(apiResponse);
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

        const updatedComment = await service.updateComment({
          userId,
          commentId,
          content,
        });

        const apiResponse = new ApiResponse(
          200,
          updatedComment,
          "Comment updated successfully"
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
