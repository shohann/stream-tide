"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRelations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const profile_1 = __importDefault(require("./profile"));
const post_1 = __importDefault(require("./post"));
const user = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    firstName: (0, pg_core_1.varchar)("first_name", { length: 255 }).notNull(),
    lastName: (0, pg_core_1.varchar)("last_name", { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    profileId: (0, pg_core_1.integer)("profile_id")
        .notNull()
        .unique()
        .references(() => profile_1.default.id)
});
exports.userRelations = (0, drizzle_orm_1.relations)(user, ({ one, many }) => ({
    profile: one(profile_1.default, {
        fields: [user.profileId],
        references: [profile_1.default.id],
    }),
    post: many(post_1.default),
}));
exports.default = user;
