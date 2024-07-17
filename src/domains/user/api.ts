import express, { Request, Response, NextFunction } from "express";
import * as service from "./service";
import { registerUserBody, userRegister, userDetailsParams } from "./request";
import validate from "../../middlewares/validateResource";

const model = "User";

const routes = () => {
  const router = express.Router();
  console.log(`Setting up routes ${model}`);

  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userList: any = await service.list();
      res.status(201).send(userList);
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/register",
    validate(userRegister),
    async (
      req: Request<{}, {}, registerUserBody>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { firstName, lastName, email, userName, password } = req.body;
        const newUser = await service.create({
          firstName,
          lastName,
          email,
          userName,
          password,
        });

        res.status(200).json(newUser);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/:userId",
    validate(userDetailsParams),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = parseInt(req.params.userId, 10);

        const userDetails = await service.details(userId);

        res.status(200).send(userDetails);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};

export default routes;
