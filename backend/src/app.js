import express from 'express';
import morgan from 'morgan';
import { applySecurity } from './middlewares/security.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { buildDataGridRouter } from './modules/datagrid/datagrid.routes.js';
import { buildSavedViewRouter } from './modules/savedViews/savedView.routes.js';
import { buildExportHistoryRouter } from './modules/exports/exportHistory.routes.js';
import { demoAuthenticate, demoRowScope } from './modules/example/demoAuth.js';
import env from './config/env.js';

// Registers the example "employees" resource. In a real host application,
// this import is replaced by imports of that app's own *.resource.js files.
import './modules/example/employee.resource.js';

export function createApp() {
  const app = express();

  applySecurity(app);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  if (!env.isProd) app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  // --- Integration point -------------------------------------------------
  // In a real host app, swap demoAuthenticate for your existing JWT/session
  // middleware and demoRowScope for a function returning tenant/org/user
  // scoping filters (or omit buildRowScope entirely for no row scoping).
  app.use('/api/v1/datagrid', buildDataGridRouter({
    authenticate: demoAuthenticate,
    buildRowScope: demoRowScope,
  }));

  app.use('/api/v1/saved-views', buildSavedViewRouter({ authenticate: demoAuthenticate }));
  app.use('/api/v1/exports', buildExportHistoryRouter({ authenticate: demoAuthenticate }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
