import express, { Application, NextFunction, Request, Response } from 'express';
import userRouter from './route/user.route';

const app: Application = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use('/users', userRouter);

app.get('/health', async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});