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
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./route/user.route"));
const post_route_1 = __importDefault(require("./route/post.route"));
const video_route_1 = __importDefault(require("./route/video.route"));
const cors_1 = __importDefault(require("cors"));
const connect_timeout_1 = __importDefault(require("connect-timeout"));
const app = (0, express_1.default)();
const port = 8000;
app.use((0, connect_timeout_1.default)('5500s'));
// cors middleware
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static("uploads"));
app.use('/users', user_route_1.default);
app.use('/posts', post_route_1.default);
app.use('/videos', video_route_1.default);
app.get('/health', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send('OK');
}));
app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});
