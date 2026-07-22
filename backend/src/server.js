import http from 'http';
import app from './app.js';
import config, { assertConfig } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { initSocket } from './realtime/index.js';
import logger from './common/utils/logger.js';

let server;

async function bootstrap() {
  assertConfig();
  await connectDatabase();

  server = http.createServer(app);
  initSocket(server);

  server.listen(config.port, () => {
    logger.info(`RAMP HRMS API running on http://localhost:${config.port}${config.apiPrefix} [${config.env}]`);
  });
}

async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);
  if (server) server.close();
  await disconnectDatabase().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { message: reason?.message || String(reason) });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

bootstrap().catch((err) => {
  logger.error('Failed to start server', { message: err.message, stack: err.stack });
  process.exit(1);
});
