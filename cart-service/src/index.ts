import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

// Import logger
import { logger } from './utils/logger.utils';

const app = express();
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

app.listen(port, () => {
  logger.info(`⚡️ Service application listening on port ${port}`);
});
