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
exports.updateSingleUser = exports.getSingleUser = exports.getUsers = exports.createUser = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../db"));
const schema_1 = require("../db/schema");
const createUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const [userProfile] = yield db_1.default
        .insert(schema_1.profile)
        .values({
        state: 'Bangladesh'
    })
        .returning();
    const [singleUser] = yield db_1.default
        .insert(schema_1.user)
        .values({
        firstName: "Shohanur",
        lastName: "Rahman",
        email: "shohanur@gmail.com",
        password: "12345",
        profileId: userProfile.id
    })
        .returning();
    console.log(singleUser);
    return singleUser;
});
exports.createUser = createUser;
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    // Fetching all columns
    // return await db.query.user.findMany(); // ORM like query
    // return db.select().from(user); // Query builder like query
    // Fetching selected columns using ORM
    // return await db.query.user.findMany({
    //     columns: {
    //         id: true,
    //         email: true,
    //     }
    // }); 
    // Fetching selected columns using query builder
    return db_1.default
        .select({
        id: schema_1.user.id,
        email: schema_1.user.email
    })
        .from(schema_1.user);
});
exports.getUsers = getUsers;
const getSingleUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // const user = await db.query.User.findFirst({
    //     where: eq(User.id, userId)
    // });
    // const user = await db
    //     .select()
    //     .from(User)
    //     .where(eq(User.id, userId))
    // return user[0];
    const singleUser = yield db_1.default.query.user.findFirst({
        columns: {
            id: true,
            email: true
        },
        where: (0, drizzle_orm_1.eq)(schema_1.user.id, userId)
    });
    return singleUser;
});
exports.getSingleUser = getSingleUser;
const updateSingleUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.update(schema_1.user)
        .set({ lastName: 'Dann' })
        .where((0, drizzle_orm_1.eq)(schema_1.user.id, userId));
});
exports.updateSingleUser = updateSingleUser;
