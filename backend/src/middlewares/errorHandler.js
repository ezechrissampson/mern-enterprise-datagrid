import ApiError from '../core/utils/ApiError.js';
import env from '../config/env.js';

/** 404 fallback for unmatched DataGrid routes. */
export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Centralized error handler. Normalizes Mongoose/validation/unexpected
 * errors into the standard { success, statusCode, message, code, details }
 * envelope and NEVER leaks stack traces or internals in production.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error?.name === 'ValidationError') {
      error = ApiError.badRequest('Validation failed', error.errors);
    } else if (error?.name === 'CastError') {
      error = ApiError.badRequest(`Invalid value for field "${error.path}"`);
    } else if (error?.code === 11000) {
      error = ApiError.conflict('Duplicate value violates a unique constraint');
    } else if (error?.message === 'Not allowed by CORS') {
      error = ApiError.forbidden('Origin not allowed');
    } else {
      error = ApiError.internal(env.isProd ? 'Internal server error' : error?.message);
    }
  }

  if (!error.isOperational) {
    // eslint-disable-next-line no-console
    console.error('[UNEXPECTED ERROR]', err);
  }

  const payload = {
    success: false,
    statusCode: error.statusCode,
    code: error.code,
    message: error.message,
  };
  if (error.details && !env.isProd) payload.details = error.details;

  res.status(error.statusCode).json(payload);
}

export default errorHandler;
