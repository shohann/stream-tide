import express, { Request, Response, NextFunction } from "express";
import { create } from "./service";

const model = "User";

const routes = () => {
  const router = express.Router();
  console.log(`Setting up routes ${model}`);

  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await create({
        firstName: "Shohanur",
        lastName: "Rahman",
      });

      res.status(201).send(user);
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default routes;
