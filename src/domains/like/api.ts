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

  return router;
};

export default routes;
