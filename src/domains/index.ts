import { Router } from "express";
import userRoutes from "./user";
import videoRoutes from './video';
import likeRoutes from './like';
import commentRoutes from './comment';
import playlistRoutes from './playlist';

const defineRoutes = async (expressRouter: Router) => {
  userRoutes(expressRouter);
  videoRoutes(expressRouter);
  likeRoutes(expressRouter);
  commentRoutes(expressRouter);
  playlistRoutes(expressRouter);
};

export default defineRoutes;
