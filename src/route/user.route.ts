import { Router } from "express";
import {
   createUserController,
   getUsersController,
   getSingleUserController,
   updateSingleUserController
} from "../controller/user.controller";

const userRouter = Router();

userRouter
    .route('/')
    .post(createUserController)
    .get(getUsersController);

userRouter
    .route('/:user_id')
    .get(getSingleUserController)
    .patch(updateSingleUserController)

export default userRouter;