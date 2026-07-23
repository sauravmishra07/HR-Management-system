import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import routes from './routes/index.js';
import { morganStream } from './common/utils/logger.js';
import { apiLimiter } from './common/middlewares/rateLimit.middleware.js';
import { mongoInjectionGuard, xssGuard } from './common/middlewares/sanitize.middleware.js';
import { notFoundHandler, errorHandler } from './common/middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

// ---- Security & parsing ----
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: config.clientUrls,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(config.security.cookieSecret));
app.use(compression());
app.use(mongoInjectionGuard);
app.use(xssGuard);
app.use(morgan(config.isProd ? 'combined' : 'dev', { stream: morganStream }));

// ---- Static uploads ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- Health check ----
app.get('/health', (req, res) =>
  res.json({
    success: true,
    status: 'ok',
    env: config.env,
    uptime: process.uptime(),
    currentTimeUtc: new Date().toISOString(),
    currentTimeLocal: new Date().toString()
  })
);

// ---- API ----
app.use(config.apiPrefix, apiLimiter, routes);

// ---- 404 + errors ----
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
