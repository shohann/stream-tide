import { Router } from "express";
import routes from "./api";

const defineRoutes = (expressRouter: Router) => {
    expressRouter.use('/users', routes());
};

export default defineRoutes;