"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsController = exports.createPostController = void 0;
const post_service_1 = require("../service/post.service");
const createPostController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, post_service_1.createPost)();
        res.status(200).send();
    }
    catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});
exports.createPostController = createPostController;
const getPostsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield (0, post_service_1.getPostsWithUser)();
        res.status(200).send(posts);
    }
    catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});
exports.getPostsController = getPostsController;
