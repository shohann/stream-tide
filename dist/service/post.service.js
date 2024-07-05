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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsWithUser = exports.createPost = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../db"));
const schema_1 = require("../db/schema");
const createPost = () => __awaiter(void 0, void 0, void 0, function* () {
    const userId = 25;
    const [newPost] = yield db_1.default
        .insert(schema_1.post)
        .values({
        content: 'Test 1',
        authorId: userId
    })
        .returning();
    console.log(newPost);
});
exports.createPost = createPost;
const getPostsWithUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield db_1.default
        // .select()
        // .from(post)
        // .leftJoin(user, eq(user.id, 25))
        .query
        .post
        .findMany({
        where: (0, drizzle_orm_1.eq)(schema_1.post.authorId, 25),
        with: {
            author: true
        }
    });
    return posts;
});
exports.getPostsWithUser = getPostsWithUser;
