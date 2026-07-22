import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';
import config from '../../config/index.js';

/**
 * Constant-time string comparison. Both sides are hashed first so the
 * buffers always have equal length (timingSafeEqual requirement) and the
 * comparison leaks nothing about the key's length or content.
 */
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/**
 * Guard for server-to-server integration routes (DDD -> HRMS).
 * Validates the shared `x-api-key` header instead of a user JWT.
 * 401 on missing/wrong key; 503 when the key is not configured at all.
 */
export const requireApiKey = (req, res, next) => {
  if (!config.integrationApiKey) {
    return next(new ApiError(503, 'Integration is not configured'));
  }
  const provided = req.headers['x-api-key'];
  if (!provided || !safeEqual(provided, config.integrationApiKey)) {
    return next(ApiError.unauthorized('Invalid API key'));
  }
  return next();
};

export default requireApiKey;
