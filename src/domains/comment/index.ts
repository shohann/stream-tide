import { Router } from "express";
import routes from "./api";

const defineRoutes = (expressRouter: Router) => {
    expressRouter.use('/comments', routes());
};

export default defineRoutes;