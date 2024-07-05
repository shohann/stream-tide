import express, { Request, Response, NextFunction } from 'express';

const model = 'User';

const  routes = () => {
    const router = express.Router();
    console.log(`Setting up routes ${model}`);

    router.get('/', async(req: Request, res: Response, next: NextFunction) => {
        try {
            res.send("OK")
        } catch (error) {
            next(error)
        }
    });

    return router;
};

export default routes;