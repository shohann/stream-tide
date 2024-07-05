"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controller/user.controller");
const userRouter = (0, express_1.Router)();
userRouter
    .route('/')
    .post(user_controller_1.createUserController)
    .get(user_controller_1.getUsersController);
userRouter
    .route('/:user_id')
    .get(user_controller_1.getSingleUserController)
    .patch(user_controller_1.updateSingleUserController);
exports.default = userRouter;
