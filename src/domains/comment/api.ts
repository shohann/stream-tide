import express, { Request, Response, NextFunction } from "express";
import * as service from "./service";
import validate from "../../middlewares/validateResource";
import { createComment, createCommentType } from "./request";
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

  return router;
};

export default routes;
