import app from './app';
import { logger } from './utils/logger.utils';

const PORT = 8080;

app.listen(PORT, () => {
  logger.info(`⚡️ Service listening on port ${PORT}`);
});
