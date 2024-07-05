import { Router } from 'express';
import userRoutes from './user';

const defineRoutes = async (expressRouter: Router) => {
    userRoutes(expressRouter);
};

export default defineRoutes;