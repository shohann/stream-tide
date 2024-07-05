"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRelations = exports.post = exports.profile = exports.userRelations = exports.user = exports.category = void 0;
var category_1 = require("./category");
Object.defineProperty(exports, "category", { enumerable: true, get: function () { return __importDefault(category_1).default; } });
var user_1 = require("./user");
Object.defineProperty(exports, "user", { enumerable: true, get: function () { return __importDefault(user_1).default; } });
Object.defineProperty(exports, "userRelations", { enumerable: true, get: function () { return user_1.userRelations; } });
var profile_1 = require("./profile");
Object.defineProperty(exports, "profile", { enumerable: true, get: function () { return __importDefault(profile_1).default; } });
var post_1 = require("./post");
Object.defineProperty(exports, "post", { enumerable: true, get: function () { return __importDefault(post_1).default; } });
Object.defineProperty(exports, "postRelations", { enumerable: true, get: function () { return post_1.postRelations; } });
