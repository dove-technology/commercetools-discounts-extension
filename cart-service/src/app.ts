import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { errorMiddleware } from './middleware/error.middleware';
import CustomError from './errors/custom.error';
import { proxy } from './lib/commerce-tools-dovetech-proxy';
import { readConfiguration } from './utils/config.utils';
import { logger } from './utils/logger.utils';

dotenv.config();

const configuration = readConfiguration();

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());

app.post('/cart-service', (req: Request, res: Response) => {
  const { resource } = req.body;

  if (!resource?.obj) {
    throw new CustomError(400, 'Bad request - Missing resource object.');
  }

  const cart = resource.obj;

  // not sure about async in Express v4 at the moment
  proxy(configuration, cart)
    .then((extensionResponse) => {
      if (extensionResponse.success) {
        res.status(200).json({
          actions: extensionResponse.actions,
        });
        return;
      }
      res
        .status(extensionResponse.errorResponse.statusCode)
        .json(extensionResponse.errorResponse);
    })
    .catch((error) => {
      if (error instanceof CustomError) {
        logger.error(error.message);
      } else {
        logger.error(error);
      }

      // we don't want to fail the action if the extension fails so return empty actions
      res.status(200).json({
        actions: [],
      });
      return;
    });
});

app.use('*', () => {
  throw new CustomError(404, 'Path not found.');
});

// Global error handler
app.use(errorMiddleware);

export default app;
