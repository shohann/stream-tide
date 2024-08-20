import express, { Request, Response, NextFunction } from "express";
import logger from "../../libraries/log/logger";

const routes = () => {
  const router = express.Router();
  logger.info(`Setting up routes playlist`);

  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.send("OK");
    } catch (error: any) {
      next(error);
    }
  });

  return router;
};

export default routes;
