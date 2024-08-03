import { Router } from "express";
import routes from "./api";

const defineRoutes = (expressRouter: Router) => {
    expressRouter.use('/playlists', routes());
};

export default defineRoutes;