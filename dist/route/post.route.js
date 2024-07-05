"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controller/post.controller");
const postRouter = (0, express_1.Router)();
postRouter
    .route('/')
    .post(post_controller_1.createPostController)
    .get(post_controller_1.getPostsController);
exports.default = postRouter;
