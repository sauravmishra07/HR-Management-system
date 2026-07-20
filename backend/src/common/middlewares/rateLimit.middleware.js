import rateLimit from 'express-rate-limit';
import config from '../../config/index.js';

const handler = (req, res) =>
  res.status(429).json({ success: false, message: 'Too many requests, please try again later.', errors: [] });

/** General API limiter. */
export const apiLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/** Stricter limiter for auth endpoints to blunt brute-force attempts. */
export const authLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
