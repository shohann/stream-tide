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
exports.updateSingleUserController = exports.getSingleUserController = exports.getUsersController = exports.createUserController = void 0;
const user_service_1 = require("../service/user.service");
const createUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, user_service_1.createUser)();
        res.status(200).send();
    }
    catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});
exports.createUserController = createUserController;
const getUsersController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, user_service_1.getUsers)();
        res.status(200).send(users);
    }
    catch (error) {
        console.log(error);
    }
});
exports.getUsersController = getUsersController;
const getSingleUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.user_id;
        const user = yield (0, user_service_1.getSingleUser)(parseInt(userId));
        res.status(200).send(user);
    }
    catch (error) {
        console.log(error);
    }
});
exports.getSingleUserController = getSingleUserController;
const updateSingleUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.user_id;
        yield (0, user_service_1.updateSingleUser)(parseInt(userId));
        res.status(200).send();
    }
    catch (error) {
        console.log(error);
    }
});
exports.updateSingleUserController = updateSingleUserController;
