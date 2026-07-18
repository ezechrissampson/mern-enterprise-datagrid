import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import ApiError from '../core/utils/ApiError.js';

/**
 * OWASP-aligned baseline middleware. Mount `applySecurity(app)` before any
 * DataGrid routes. This module intentionally does NOT implement
 * authentication/authorization — the host application supplies those and
 * this module only consumes `req.user` / `req.permissions`.
 */
export function applySecurity(app) {
  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: env.isProd ? undefined : false,
    crossOriginResourcePolicy: { policy: 'same-site' },
  }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));
  app.use(compression());
  // Strips any key starting with `$` or containing `.` from req.body/query/params
  // -> primary defense against NoSQL / operator injection.
  app.use(mongoSanitize({ replaceWith: '_' }));
  // HTTP Parameter Pollution protection (e.g. ?sort=a&sort=b tampering)
  app.use(hpp());
}

/** Rate limiter for general DataGrid read endpoints. */
export const gridReadLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => next(ApiError.tooManyRequests()),
});

/** Stricter limiter for write / bulk / export endpoints. */
export const gridWriteLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: Math.max(20, Math.floor(env.RATE_LIMIT_MAX / 4)),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => next(ApiError.tooManyRequests()),
});

/**
 * Mass-assignment guard: strips any body key not present in `allowedFields`
 * before it reaches a service/repository layer. Use on create/update routes.
 */
export function allowFields(allowedFields = []) {
  const allowSet = new Set(allowedFields);
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      const clean = {};
      for (const key of Object.keys(req.body)) {
        if (allowSet.has(key)) clean[key] = req.body[key];
      }
      req.body = clean;
    }
    next();
  };
}

export default applySecurity;
