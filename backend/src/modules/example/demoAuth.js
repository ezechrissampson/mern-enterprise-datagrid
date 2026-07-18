/**
 * DEMO ONLY. Real integrations pass their own `authenticate` middleware
 * (JWT/session verification, etc.) into buildDataGridRouter — this stub
 * exists only so the module can run standalone for local development.
 */
export function demoAuthenticate(req, res, next) {
  req.user = {
    id: 'demo-user-id',
    roles: ['admin'],
    permissions: ['*'],
    isSuperAdmin: true,
  };
  next();
}

export function demoRowScope() {
  return {};
}

export default demoAuthenticate;
