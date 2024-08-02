import { Router } from "express";
import userRoutes from "./user";
import videoRoutes from './video';
import likeRoutes from './like';
import commentRoutes from './comment';

const defineRoutes = async (expressRouter: Router) => {
  userRoutes(expressRouter);
  videoRoutes(expressRouter);
  likeRoutes(expressRouter);
  commentRoutes(expressRouter);
};

export default defineRoutes;
