import { Router } from "express";
import userRoutes from "./user";
import videoRoutes from './video';

const defineRoutes = async (expressRouter: Router) => {
  userRoutes(expressRouter);
  videoRoutes(expressRouter);
};

export default defineRoutes;
