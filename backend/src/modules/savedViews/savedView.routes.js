import { Router } from 'express';
import { param, query, body, validationResult } from 'express-validator';
import * as controller from './savedView.controller.js';
import ApiError from '../../core/utils/ApiError.js';

function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) return next(ApiError.badRequest('Invalid request', result.array()));
  return next();
}

const idParam = [param('id').isString().trim().matches(/^[a-fA-F0-9]{24}$/).withMessage('Invalid id')];

/**
 * buildSavedViewRouter
 * ---------------------
 * Mount alongside the DataGrid router, using the SAME `authenticate`
 * middleware from your host app:
 *
 *   app.use('/api/v1/saved-views', buildSavedViewRouter({ authenticate }));
 */
export function buildSavedViewRouter({ authenticate } = {}) {
  const router = Router();
  if (typeof authenticate === 'function') router.use(authenticate);

  router.get('/', [query('resource').isString().trim().notEmpty()], handleValidation, controller.listSavedViews);

  router.post(
    '/',
    [
      body('resource').isString().trim().notEmpty(),
      body('name').isString().trim().isLength({ min: 1, max: 80 }),
      body('isShared').optional().isBoolean(),
    ],
    handleValidation,
    controller.createSavedView,
  );

  router.patch('/:id', idParam, handleValidation, controller.updateSavedView);
  router.delete('/:id', idParam, handleValidation, controller.deleteSavedView);
  router.post('/:id/default', idParam, handleValidation, controller.setDefaultSavedView);

  return router;
}

export default buildSavedViewRouter;
