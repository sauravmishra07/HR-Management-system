import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend root regardless of the working directory.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const num = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const bool = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
};

/**
 * Centralised, validated configuration object.
 * Every module reads from here instead of touching process.env directly.
 */
export const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: num(process.env.PORT, 5000),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  /** All allowed browser origins (CLIENT_URL may be a comma-separated list). */
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  /** Primary frontend URL (first entry) — used for links in emails, etc. */
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim(),

  mongoUri: process.env.MONGODB_URI,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    resetSecret: process.env.JWT_RESET_SECRET,
    resetExpiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m',
  },

  security: {
    bcryptSaltRounds: num(process.env.BCRYPT_SALT_ROUNDS, 10),
    rateLimitWindowMs: num(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    rateLimitMax: num(process.env.RATE_LIMIT_MAX, 300),
    authRateLimitMax: num(process.env.AUTH_RATE_LIMIT_MAX, 20),
    cookieSecret: process.env.COOKIE_SECRET || 'cookie_secret',
  },

  mail: {
    host: process.env.SMTP_HOST,
    port: num(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'RAMP HRMS <no-reply@itsybizz.com>',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'src/uploads',
    maxFileSizeMb: num(process.env.MAX_FILE_SIZE_MB, 10),
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'ramp-hrms',
    // Enabled only when all three credentials are present.
    enabled: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    ),
  },

  seedDefaultPassword: process.env.SEED_DEFAULT_PASSWORD || 'Password@123',

  // ---- DDD (ITSYBIZZ Command Center) integration ----
  // Shared secret for server-to-server calls in BOTH directions (x-api-key header).
  integrationApiKey: process.env.INTEGRATION_API_KEY || '',
  dddApiUrl: process.env.DDD_API_URL || 'http://localhost:5500/api/v1',
  integrationEnabled: bool(process.env.INTEGRATION_ENABLED, false),
};

/** Fail fast if critical secrets are missing. */
export function assertConfig() {
  const required = [
    ['MONGODB_URI', config.mongoUri],
    ['JWT_ACCESS_SECRET', config.jwt.accessSecret],
    ['JWT_REFRESH_SECRET', config.jwt.refreshSecret],
  ];
  const missing = required.filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default config;
