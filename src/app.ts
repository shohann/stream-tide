import express, { Application, NextFunction, Request, Response } from 'express';

const app: Application = express();
const port = 8000;

app.get('/health', async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
})