import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { errorMiddleware } from './middleware/error.middleware';
import CustomError from './errors/custom.error';
import { logger } from './utils/logger.utils';
import { proxy } from './lib/commerce-tools-dovetech-proxy';
import { readConfiguration } from './utils/config.utils';

dotenv.config();

const configuration = readConfiguration();

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());

const port = 8080;

app.post('/cart-service', (req: Request, res: Response) => {
  const cart = req.body.resource.obj;

  // not sure about async in Express v4 at the moment
  proxy(configuration, cart).then((extensionResponse) => {
    if (extensionResponse.success) {
      res.status(200).json({
        actions: extensionResponse.actions,
      });
      return;
    }
    res
      .status(extensionResponse.errorResponse.statusCode)
      .json(extensionResponse.errorResponse);
  });
});

app.use('*', () => {
  throw new CustomError(404, 'Path not found.');
});

// Global error handler
app.use(errorMiddleware);

app.listen(port, () => {
  logger.info(`⚡️ Service application listening on port ${port}`);
});
