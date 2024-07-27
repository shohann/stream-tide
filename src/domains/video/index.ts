import { Router } from "express";
import routes from "./api";

const defineRoutes = (expressRouter: Router) => {
    expressRouter.use('/videos', routes());
};

export default defineRoutes;