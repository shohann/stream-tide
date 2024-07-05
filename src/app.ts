import express, { Application, Request, Response } from 'express';
import domainRoutes from './domains';

function defineRoutes(expressApp: Application) {
  console.log('Defining routes...');
  const router = express.Router();

  domainRoutes(router);

  expressApp.use('/api/v1', router);
  // Health check
  expressApp.get('/health', (req: Request, res: Response) => {
    res.status(200).send('OK');
  });
  // 404
  expressApp.use((req, res) => {
    res.status(404).send('Not Found');
  })
  console.log('Routes defined');
};

export default defineRoutes;