import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { errorMiddleware } from './middleware/error.middleware';
import CustomError from './errors/custom.error';
import { logger } from './utils/logger.utils';

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());

const port = 8080;

app.post('/cart-service', (req: Request, res: Response) => {
  const cart = req.body.resource.obj;
  logger.info('Cart received', cart.id);

  res.status(200).json({
    actions: [],
  });
  return;
});

app.use('*', () => {
  throw new CustomError(404, 'Path not found.');
});

// Global error handler
app.use(errorMiddleware);

app.listen(port, () => {
  logger.info(`⚡️ Service application listening on port ${port}`);
});
