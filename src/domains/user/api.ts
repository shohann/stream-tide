import express, { Request, Response, NextFunction } from "express";
import * as service from "./service";
import {
  registerUserBody,
  userRegister,
  userDetailsParams,
  userLogin,
  loginUserBody,
  userUpdateParams,
  userUpdate,
  userUpdateType,
} from "./request";
import validate, { validateAndParse } from "../../middlewares/validateResource";
import upload from "../../libraries/util/upload";
import { authorize } from "../../middlewares/auth";
import uploadSingleImage from "../../libraries/cloudinary/upload-single-image";

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
        const newUser = await service.register({
          firstName,
          lastName,
          email,
          userName,
          password,
        });

        res.status(200).json(newUser);
      } catch (error: any) {
        next(error);
      }
    }
  );

  router.post(
    "/login",
    validate(userLogin),
    async (
      req: Request<{}, {}, loginUserBody>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { email, password } = req.body;

        const result = await service.login({
          email,
          password,
        });

        res.status(200).send(result);
      } catch (error: any) {
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
      } catch (error: any) {
        next(error);
      }
    }
  );

  router.put(
    "/:userId",
    authorize,
    validate(userUpdateParams),
    upload.single("file"),
    validateAndParse(userUpdate),
    async (
      req: Request<{}, {}, userUpdateType>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { age, isMale } = req.body;

        const imageFile = req.file;

        const imagePath = imageFile?.path;

        let result;
        if (imagePath) {
          result = await uploadSingleImage(imagePath);
        }

        // console.log(result);

        res.status(201).send("OK");
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};

export default routes;
