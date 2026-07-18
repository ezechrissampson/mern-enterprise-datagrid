import ApiError from '../core/utils/ApiError.js';

/**
 * RBAC integration point.
 *
 * This module does not implement authorization itself — the host
 * application already has an RBAC/permission system. This middleware just
 * gives the DataGrid module a consistent contract to check against it.
 *
 * Expected contract (adapt `resolvePermissions` to your existing auth
 * middleware's output, e.g. req.user.permissions, req.user.roles, a
 * `can()` helper attached by your auth module, etc.):
 *
 *   req.user = { id, roles: ['admin'], permissions: ['users:read', 'users:export'] }
 *
 * Usage:
 *   router.get('/:resource', requirePermission((req) => `${req.params.resource}:read`), ...)
 */

function resolvePermissions(req) {
  return req.user?.permissions || [];
}

export function requirePermission(permissionOrFn) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());

    const required = typeof permissionOrFn === 'function' ? permissionOrFn(req) : permissionOrFn;
    const perms = resolvePermissions(req);

    // Wildcard / superadmin support, e.g. role check performed upstream.
    if (perms.includes('*') || req.user.isSuperAdmin) return next();

    if (!perms.includes(required)) {
      return next(ApiError.forbidden(`Missing required permission: ${required}`));
    }
    return next();
  };
}

/**
 * Attaches a `req.gridScope` object that repositories/services can merge
 * into the base Mongo filter to enforce row-level security (e.g. a user may
 * only see records in their own organization/tenant/department).
 *
 * Adapt `buildScope` to your application's data-ownership model.
 */
export function attachRowScope(buildScope) {
  return (req, res, next) => {
    try {
      req.gridScope = typeof buildScope === 'function' ? buildScope(req) : {};
    } catch (err) {
      return next(err);
    }
    next();
  };
}

export default requirePermission;
