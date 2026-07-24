import { Router } from 'express';
import { param, query, validationResult } from 'express-validator';
import * as controller from './exportHistory.controller.js';
import ApiError from '../../core/utils/ApiError.js';

function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) return next(ApiError.badRequest('Invalid request', result.array()));
  return next();
}

/**
 * buildExportHistoryRouter
 * -------------------------
 * Mount alongside the DataGrid router, using the SAME `authenticate`
 * middleware from your host app:
 *
 *   app.use('/api/v1/exports', buildExportHistoryRouter({ authenticate }));
 */
export function buildExportHistoryRouter({ authenticate } = {}) {
  const router = Router();
  if (typeof authenticate === 'function') router.use(authenticate);

  router.get(
    '/',
    [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })],
    handleValidation,
    controller.listExports,
  );

  router.get(
    '/:id/download',
    [param('id').isString().trim().matches(/^[a-fA-F0-9]{24}$/)],
    handleValidation,
    controller.downloadExport,
  );

  router.delete(
    '/:id',
    [param('id').isString().trim().matches(/^[a-fA-F0-9]{24}$/)],
    handleValidation,
    controller.deleteExport,
  );

  return router;
}

export default buildExportHistoryRouter;
