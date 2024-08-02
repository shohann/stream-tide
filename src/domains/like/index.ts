import { Router } from "express";
import routes from "./api";

const defineRoutes = (expressRouter: Router) => {
    expressRouter.use('/likes', routes());
};

export default defineRoutes;