import 'dotenv/config';

/**
 * Centralized, validated environment configuration.
 * Fails fast at boot if required variables are missing/invalid instead of
 * surfacing cryptic errors deep inside the request lifecycle.
 */
function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }
  return value;
}

function toInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`[env] Environment variable ${name} must be an integer, got "${raw}"`);
  }
  return parsed;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: toInt('PORT', 5000),
  MONGO_URI: process.env.MONGO_URI || '',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  REDIS_URL: process.env.REDIS_URL || '',
  RATE_LIMIT_WINDOW_MS: toInt('RATE_LIMIT_WINDOW_MS', 60_000),
  RATE_LIMIT_MAX: toInt('RATE_LIMIT_MAX', 300),
  EXPORT_MAX_ROWS: toInt('EXPORT_MAX_ROWS', 50_000),
  MAX_PAGE_SIZE: toInt('MAX_PAGE_SIZE', 500),
  EXPORT_STORAGE_DIR: process.env.EXPORT_STORAGE_DIR || '',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
};

export default env;
