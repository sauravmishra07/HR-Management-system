import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import config from '../../config/index.js';

/** 404 handler for unmatched routes. */
export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/** Normalise common Mongoose/JWT errors into ApiError shapes. */
function normalize(err) {
  if (err instanceof ApiError) return err;

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return ApiError.unprocessable('Validation failed', errors);
  }
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`Duplicate value for ${field}: ${err.keyValue?.[field]}`);
  }
  if (err.name === 'JsonWebTokenError') return ApiError.unauthorized('Invalid token');
  if (err.name === 'TokenExpiredError') return ApiError.unauthorized('Token expired');

  return new ApiError(err.statusCode || 500, err.message || 'Internal server error', [], false);
}

/** Centralised error responder. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const error = normalize(err);

  if (!error.isOperational || error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} — ${error.message}`, { stack: err.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} — ${error.statusCode} ${error.message}`);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    ...(config.isProd ? {} : { stack: err.stack }),
  });
}
