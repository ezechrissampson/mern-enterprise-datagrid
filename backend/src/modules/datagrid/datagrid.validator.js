import { param, query, body, validationResult } from 'express-validator';
import ApiError from '../../core/utils/ApiError.js';

/** Throws a formatted ApiError if any express-validator rule failed. */
export function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(ApiError.badRequest('Invalid request', result.array()));
  }
  return next();
}

export const resourceParam = [
  param('resource').isString().trim().isLength({ min: 1, max: 64 }).matches(/^[a-zA-Z0-9_-]+$/),
];

export const idParam = [
  param('id').isString().trim().isLength({ min: 1, max: 64 }).matches(/^[a-fA-F0-9]{24}$/).withMessage('Invalid record id'),
];

export const listQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 500 }).toInt(),
  query('search').optional().isString().trim().isLength({ max: 200 }),
  query('sort').optional().isString().trim().isLength({ max: 200 }),
  query('fields').optional().isString().trim().isLength({ max: 500 }),
  query('filters').optional(),
];

export const bulkBody = [
  body('ids').isArray({ min: 1, max: 5000 }),
  body('ids.*').isString().trim().isLength({ min: 1, max: 64 }),
];

export const bulkUpdateBody = [
  ...bulkBody,
  body('patch').isObject().custom((v) => Object.keys(v).length > 0),
];

export const exportQuery = [
  query('format').isIn(['csv', 'xlsx', 'json']).withMessage('format must be one of csv, xlsx, json'),
  ...listQuery,
];

export default { handleValidation, resourceParam, idParam, listQuery, bulkBody, bulkUpdateBody, exportQuery };
