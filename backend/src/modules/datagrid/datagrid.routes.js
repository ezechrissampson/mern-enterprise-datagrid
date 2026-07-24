import { Router } from 'express';
import * as controller from './datagrid.controller.js';
import * as validators from './datagrid.validator.js';
import { requirePermission, attachRowScope } from '../../middlewares/permission.js';
import { gridReadLimiter, gridWriteLimiter } from '../../middlewares/security.js';

/**
 * buildDataGridRouter
 * --------------------
 * Factory that produces the DataGrid Express router, wired to the HOST
 * application's own auth middleware. Nothing app-specific lives inside the
 * module itself — you inject your existing middleware here.
 *
 *   import { buildDataGridRouter } from '.../datagrid.routes.js';
 *   import { authenticate } from '../auth/authenticate.js';
 *   import { buildTenantScope } from '../auth/scope.js';
 *
 *   app.use('/api/v1/datagrid', buildDataGridRouter({
 *     authenticate,
 *     buildRowScope: buildTenantScope, // optional row-level scoping
 *   }));
 */
export function buildDataGridRouter({ authenticate, buildRowScope } = {}) {
  const router = Router();

  if (typeof authenticate === 'function') {
    router.use(authenticate);
  }
  if (typeof buildRowScope === 'function') {
    router.use(attachRowScope(buildRowScope));
  }

  const { resourceParam, idParam, listQuery, bulkBody, bulkUpdateBody, exportQuery, handleValidation } = validators;

  // Literal path — must be registered before the `/:resource` routes below
  // so it isn't swallowed by the `:resource` param pattern.
  router.get('/resources', controller.listDataGridResources);

  router.get(
    '/:resource/meta',
    resourceParam,
    handleValidation,
    requirePermission((req) => `${req.params.resource}:read`),
    controller.getResourceMeta,
  );

  router.get(
    '/:resource',
    gridReadLimiter,
    resourceParam,
    listQuery,
    handleValidation,
    requirePermission((req) => `${req.params.resource}:read`),
    controller.listRecords,
  );

  router.get(
    '/:resource/export',
    gridWriteLimiter,
    resourceParam,
    exportQuery,
    handleValidation,
    requirePermission((req) => `${req.params.resource}:export`),
    controller.exportRecords,
  );

  router.get(
    '/:resource/:id',
    resourceParam,
    idParam,
    handleValidation,
    requirePermission((req) => `${req.params.resource}:read`),
    controller.getRecord,
  );

  router.post(
    '/:resource',
    gridWriteLimiter,
    resourceParam,
    handleValidation,
    requirePermission((req) => `${req.params.resource}:create`),
    controller.createRecord,
  );

  router.patch(
    '/:resource/:id',
    gridWriteLimiter,
    resourceParam,
    idParam,
    handleValidation,
    requirePermission((req) => `${req.params.resource}:update`),
    controller.updateRecord,
  );

  router.delete(
    '/:resource/:id',
    gridWriteLimiter,
    resourceParam,
    idParam,
    handleValidation,
    requirePermission((req) => `${req.params.resource}:delete`),
    controller.deleteRecord,
  );

  router.post(
    '/:resource/bulk/delete',
    gridWriteLimiter,
    resourceParam,
    bulkBody,
    handleValidation,
    requirePermission((req) => `${req.params.resource}:bulkDelete`),
    controller.bulkDelete,
  );

  router.post(
    '/:resource/bulk/update',
    gridWriteLimiter,
    resourceParam,
    bulkUpdateBody,
    handleValidation,
    requirePermission((req) => `${req.params.resource}:bulkUpdate`),
    controller.bulkUpdate,
  );

  return router;
}

export default buildDataGridRouter;
