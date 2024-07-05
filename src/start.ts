import { startWebServer } from './server';

const start = async (): Promise<void> => {
  await startWebServer();
};

start()
  .then(() => {
    console.log('Done');
  })
  .catch((error: unknown) => {
    console.error(error);
  });