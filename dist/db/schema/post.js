"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRelations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = __importDefault(require("./user"));
const post = (0, pg_core_1.pgTable)('posts', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    content: (0, pg_core_1.text)('content'),
    authorId: (0, pg_core_1.integer)('author_id').notNull().references(() => user_1.default.id),
});
exports.postRelations = (0, drizzle_orm_1.relations)(post, ({ one }) => ({
    author: one(user_1.default, {
        fields: [post.authorId],
        references: [user_1.default.id],
        relationName: 'author'
    })
}));
exports.default = post;
