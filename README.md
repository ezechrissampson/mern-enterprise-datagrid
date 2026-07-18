# Enterprise DataGrid Module (MERN)

A reusable, config-driven, server-side Enterprise DataGrid for MERN applications —
built to feel like AG Grid / MUI DataGrid Pro / TanStack Table, but native to
**Bootstrap 5** and designed to drop into an existing MERN app that already has
Authentication and Authorization.

> **Status**: This repository ships a real, working core (backend query engine +
> generic REST API + security middleware, and a config-driven React grid with
> pagination, sorting, filtering, search, column management, export, bulk
> actions, and row actions). Some items in the original spec — persisted
> shared "Saved Views", CSV/Excel **import**, drag-to-reorder columns, group-by
> UI, infinite scroll, and Redis caching — are architected for but stubbed or
> left as extension points. See [Roadmap](#roadmap--extension-guide) for exactly
> what's implemented vs. what's next and where to plug it in.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Integration Guide](#integration-guide)
- [Configuration System](#configuration-system)
- [Backend Query Builder](#backend-query-builder)
- [Backend API Reference](#backend-api-reference)
- [Frontend Components](#frontend-components)
- [Security Features](#security-features)
- [Performance Optimizations](#performance-optimizations)
- [Environment Variables](#environment-variables)
- [Deployment Guide](#deployment-guide)
- [Production Checklist](#production-checklist)
- [Roadmap / Extension Guide](#roadmap--extension-guide)

---

## Features

**Implemented and working end-to-end:**

- Server-side pagination, sorting (multi-column, shift-click), searching, filtering
- Config-driven generic REST API — one route set serves *any* registered Mongo collection
- Reusable backend Query Builder (search + filters + sort + pagination + field selection, all allow-listed)
- Global debounced search across configured `searchable` fields
- Structured filters: equals, contains, gt/gte/lt/lte, in/nin, between, exists, boolean
- Column visibility toggling, density selector (compact/comfortable/spacious), sticky header, sticky first column
- Row selection (single/multi/select-page/clear/invert), persistent across the session
- Bulk delete, bulk update (e.g. archive), bulk export (native), bulk custom actions (via callback)
- Row actions (view/edit/delete/duplicate/custom) with permission-aware rendering and confirm dialogs
- Export: CSV (streamed), Excel (streamed via ExcelJS), JSON — for current filter set, or selected rows only
- Loading skeletons, empty states, error states with retry
- Column/filter/sort/density preferences persisted to `localStorage` per grid (`storageKey`)
- OWASP-aligned backend security stack (see [Security Features](#security-features))
- Clean layered backend architecture: routes → controller → service → repository → query builder

**Architected with a clear extension point, not yet fully implemented (see Roadmap):**

- Saved Views persisted server-side & shared between users (currently: local persistence only)
- CSV/Excel **import** with preview/validation/rollback
- Drag-to-reorder columns and column pinning UI (state fields exist: `columnOrder`, `pinnedColumns`)
- Group-by / collapsible group rows
- Virtualized rendering for very large pages (react-window integration point noted inline)
- Redis caching of list queries (env var + client wiring point provided)
- Audit logging (a call-site is documented in the service layer)

---

## Tech Stack

**Frontend:** React 19, Vite, Bootstrap 5, Bootstrap Icons, React Icons, React Router DOM, Axios, TanStack Table (headless engine)

**Backend:** Node.js, Express.js, MongoDB, Mongoose

**Supporting packages:** express-validator, helmet, compression, cors, hpp, express-mongo-sanitize, express-rate-limit, dotenv, lodash, uuid, exceljs, fast-csv, morgan. `ioredis` is included as a dependency for the caching extension point described in the Roadmap.

---

## Folder Structure

```
mern-enterprise-datagrid/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js                  # Validated, centralized env config
│   │   ├── core/
│   │   │   ├── queryBuilder/
│   │   │   │   └── QueryBuilder.js     # The reusable Mongo query engine
│   │   │   └── utils/
│   │   │       ├── ApiError.js
│   │   │       ├── ApiResponse.js
│   │   │       └── asyncHandler.js
│   │   ├── middlewares/
│   │   │   ├── security.js             # helmet/cors/hpp/sanitize/rate-limit/mass-assignment guard
│   │   │   ├── permission.js           # RBAC integration contract
│   │   │   └── errorHandler.js         # Centralized error handling
│   │   ├── modules/
│   │   │   ├── datagrid/               # THE REUSABLE MODULE — no app-specific code
│   │   │   │   ├── datagrid.registry.js
│   │   │   │   ├── datagrid.repository.js
│   │   │   │   ├── datagrid.service.js
│   │   │   │   ├── datagrid.controller.js
│   │   │   │   ├── datagrid.routes.js
│   │   │   │   ├── datagrid.validator.js
│   │   │   │   └── datagrid.export.js
│   │   │   └── example/                # Example integration — delete in real projects
│   │   │       ├── employee.model.js
│   │   │       ├── employee.resource.js
│   │   │       └── demoAuth.js
│   │   ├── scripts/
│   │   │   └── seed.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AppLayout.jsx           # Example shell — replace with your app's shell
    │   │   └── DataGrid/                # THE REUSABLE MODULE
    │   │       ├── DataGrid.jsx         # Main orchestrator component
    │   │       ├── DataGridToolbar.jsx
    │   │       ├── DataGridFilters.jsx
    │   │       ├── DataGridPagination.jsx
    │   │       ├── ColumnVisibilityMenu.jsx
    │   │       ├── BulkActionsBar.jsx
    │   │       ├── RowActionsMenu.jsx
    │   │       ├── DashboardStats.jsx
    │   │       ├── SkeletonLoader.jsx
    │   │       └── EmptyState.jsx
    │   ├── hooks/
    │   │   ├── useDataGrid.js          # Owns all grid state + data fetching
    │   │   └── useDebounce.js
    │   ├── services/
    │   │   ├── apiClient.js
    │   │   └── datagridService.js
    │   ├── utils/
    │   │   ├── constants.js
    │   │   └── formatters.js
    │   ├── config/
    │   │   └── example.config.js       # THE FILE YOU WRITE PER TABLE
    │   ├── pages/                       # Example pages — replace with your app's routes
    │   └── styles/theme.css            # Palette as CSS variables
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

---

## Installation

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev          # standalone demo API on :5000

# Seed example data (optional, standalone demo only)
node src/scripts/seed.js

# Frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev           # :5173, proxies /api to :5000
```

Open `http://localhost:5173` — you'll see the Dashboard and an "Employees Grid"
link demonstrating the full feature set against the seeded example collection.

---

## Integration Guide

This module is built to be dropped into an app that **already has** auth/RBAC.
Nothing inside `modules/datagrid` (backend) or `components/DataGrid` (frontend)
contains app-specific logic.

### 1. Backend — register your routes

```js
// your existing app.js
import { buildDataGridRouter } from './path/to/module/datagrid.routes.js';
import { authenticate } from '../auth/authenticate.js';   // YOUR existing middleware
import { buildTenantScope } from '../auth/scope.js';       // YOUR row-level scope (optional)

app.use('/api/v1/datagrid', buildDataGridRouter({
  authenticate,          // required: your JWT/session middleware, sets req.user
  buildRowScope: buildTenantScope, // optional: returns a Mongo filter merged into every query
}));
```

`req.user.permissions` (an array of strings, or `['*']` for superadmin) is the
contract the built-in `requirePermission` middleware checks against. Adapt
`resolvePermissions()` in `middlewares/permission.js` if your RBAC shape differs
(e.g. role-based instead of permission-string-based).

### 2. Backend — register a collection

```js
// modules/products/product.resource.js
import { registerResource } from '../datagrid/datagrid.registry.js';
import Product from './product.model.js';

registerResource('products', {
  model: Product,
  fieldsConfig: {
    name:  { path: 'name',  type: 'string', filterable: true, sortable: true, searchable: true, label: 'Name' },
    price: { path: 'price', type: 'number', filterable: true, sortable: true, label: 'Price' },
    // ...
  },
  populate: [],                 // Mongoose populate paths, if any
  bulkActions: ['delete', 'export'],
  rowActions: ['view', 'edit', 'delete'],
});
```

Import that file once at boot (anywhere before the router handles a request)
and the resource is live at `/api/v1/datagrid/products`.

### 3. Frontend — write a config and render the grid

```jsx
// config/products.config.js
export const productsGridConfig = {
  resource: 'products',
  storageKey: 'datagrid:products:v1',
  title: 'Products',
  columns: [
    { key: 'name', label: 'Name', type: 'string', sortable: true, filterable: true },
    { key: 'price', label: 'Price', type: 'number', sortable: true, filterable: true, format: 'currency' },
  ],
  permissions: { read: 'products:read', export: 'products:export' /* ... */ },
  rowActions: [{ key: 'edit', label: 'Edit', icon: 'bi-pencil' }],
  bulkActions: [{ key: 'delete', label: 'Delete', icon: 'bi-trash', variant: 'danger', confirm: true }],
};
```

```jsx
import DataGrid from '.../components/DataGrid/DataGrid.jsx';
import { productsGridConfig } from './config/products.config.js';

<DataGrid
  config={productsGridConfig}
  userPermissions={currentUser.permissions}
  onRowAction={(action, row) => { /* handle 'view'/'edit'/custom actions */ }}
/>
```

Add a sidebar link to wherever you render this page — that's the entire
frontend integration surface.

### 4. Field mapping without a fixed schema

`fieldsConfig` is the field-mapping layer: `path` can be any Mongoose document
path (including dot-notation for nested/embedded fields), so the module works
against **any** collection shape without code changes — only configuration.

---

## Configuration System

Every grid is fully described by one JS object (see
`frontend/src/config/example.config.js` for the annotated reference):

| Key | Purpose |
|---|---|
| `resource` | Backend registry key (must match `registerResource(name, ...)`) |
| `storageKey` | localStorage key for persisted column/filter/sort/density prefs |
| `columns[]` | `{ key, label, type, sortable, filterable, filterType, options, format, badge }` |
| `defaultSort` / `defaultFilters` / `defaultPageSize` | Initial grid state |
| `permissions` | Maps grid actions → permission strings checked against `userPermissions` |
| `rowActions[]` / `bulkActions[]` | `{ key, label, icon, variant, confirm, patch }` |
| `exportFormats` | Subset of `csv` / `xlsx` / `json` to offer |
| `emptyState` | `{ icon, title, description }` |

---

## Backend Query Builder

`core/queryBuilder/QueryBuilder.js` is the reusable engine behind every list
and export endpoint. It takes a Mongoose model, a `fieldsConfig` allow-list,
and the (already-validated) request query, and produces a safe, efficient
Mongo query — search, filters, sort, pagination, and projection — **without
any per-collection query logic**.

```js
const qb = new QueryBuilder(Model, fieldsConfig, req.query, { baseFilter: req.gridScope, maxPageSize: 500 })
  .applySearch()
  .applyFilters()
  .applySort()
  .applyFieldSelection()
  .applyPagination();

const { data, meta } = await qb.execute();
```

- **Every field name and operator is checked against `fieldsConfig`** — arbitrary
  client-supplied field names are rejected with `400 Bad Request`, which is
  what prevents NoSQL injection and unintended field exposure.
- `baseFilter` is **always** ANDed into the final query and cannot be
  overridden by client input — this is where row-level (tenant/org/user) scoping
  from `attachRowScope` lands.
- `.lean()` queries + explicit projection keep list queries fast and memory-light.
- `execute()` runs `find()` and `countDocuments()` concurrently via `Promise.all`.

---

## Backend API Reference

All endpoints are namespaced under wherever you mount `buildDataGridRouter`
(example: `/api/v1/datagrid`). `:resource` is any key passed to `registerResource`.

| Method | Path | Description |
|---|---|---|
| GET | `/:resource/meta` | Field definitions, row/bulk actions for building UI |
| GET | `/:resource` | List — `page`, `limit`, `search`, `sort`, `filters`, `fields` |
| GET | `/:resource/:id` | Fetch a single record |
| POST | `/:resource` | Create |
| PATCH | `/:resource/:id` | Update |
| DELETE | `/:resource/:id` | Delete |
| POST | `/:resource/bulk/delete` | Body: `{ ids: string[] }` |
| POST | `/:resource/bulk/update` | Body: `{ ids: string[], patch: object }` |
| GET | `/:resource/export` | `?format=csv\|xlsx\|json` plus same list params; `?ids=` to export only selected rows |

**List query parameters:**

- `page`, `limit` — pagination (limit capped by `MAX_PAGE_SIZE`)
- `search` — global text search across `searchable` fields
- `sort` — `field:asc,field2:desc` (multi-column)
- `filters` — JSON string, e.g. `{"salary":{"gte":50000},"department":"Engineering"}`
- `fields` — comma-separated allow-listed field keys to project

**Response envelope:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Records fetched",
  "data": [ /* ... */ ],
  "meta": { "page": 1, "limit": 25, "totalRecords": 250, "totalPages": 10, "hasNextPage": true, "hasPrevPage": false }
}
```

Errors follow the same shape with `success: false` and a `code` (e.g.
`BAD_REQUEST`, `FORBIDDEN`, `RATE_LIMITED`) instead of `data`.

---

## Frontend Components

- **`DataGrid.jsx`** — the only component you render. Composes everything below from one `config` prop.
- **`useDataGrid.js`** — all state (pagination, sort, search, filters, columns, density, selection) plus data-fetching with request cancellation (`AbortController`) on every param change, and debounced search.
- **`DataGridToolbar` / `DataGridFilters` / `BulkActionsBar` / `RowActionsMenu` / `ColumnVisibilityMenu` / `DataGridPagination`** — presentational, driven entirely by props from `DataGrid.jsx`.
- **`datagridService.js`** — thin Axios wrapper around the generic endpoints; identical for every resource.
- TanStack Table is used in **manual/headless mode** (`manualSorting`, `manualPagination`, `manualFiltering`) — it owns column/row model plumbing, the server owns the actual data operations.

---

## Security Features

Implemented in `middlewares/security.js`, `permission.js`, `errorHandler.js`, and `QueryBuilder.js`:

- **Helmet** for standard security headers
- **CORS** allow-list via `CORS_ORIGINS`
- **express-mongo-sanitize** — strips `$`/`.` keys from body/query/params (NoSQL injection defense)
- **hpp** — HTTP Parameter Pollution protection
- **express-rate-limit** — separate, stricter limiter for write/bulk/export endpoints
- **Mass-assignment protection** — `allowFields()` middleware strips unexpected body keys before they reach the service layer; additionally, `fieldsConfig`'s allow-list means the Query Builder never trusts arbitrary client field names
- **Field-level allow-listing** in the Query Builder prevents both injection and unintended data exposure (`select: false` fields, e.g. password hashes, are never projected)
- **IDOR / parameter-tampering protection** — bulk update/delete always re-applies `req.gridScope` (your row-level permission filter) server-side, so a user cannot mutate records outside their scope by supplying arbitrary IDs
- **Centralized error handling** — normalizes Mongoose/validation errors, never leaks stack traces in production
- **Secure exports** — export respects the same `gridScope` and field allow-list as list queries; row/record caps via `EXPORT_MAX_ROWS`
- **Environment validation** — `config/env.js` fails fast at boot on missing/invalid required vars
- **Audit logging integration point** — `DataGridService` methods are the single choke point for create/update/delete/bulk operations; wire your existing audit logger there

---

## Performance Optimizations

- Mongo `.lean()` queries throughout (list, export, bulk) — skips Mongoose document hydration overhead
- Explicit field projection (`applyFieldSelection`) — never over-fetches
- Recommended compound indexes shown in `employee.model.js` (`{ department: 1, status: 1 }`, text index for search) — replicate this pattern per collection
- `find()` and `countDocuments()` run concurrently via `Promise.all`
- Frontend: debounced search (350ms), `AbortController` cancels in-flight requests when params change again before the response returns
- CSV/Excel export streams directly to the HTTP response (`fast-csv`, `ExcelJS.stream.xlsx.WorkbookWriter`) instead of buffering the whole file in memory
- **Redis caching extension point**: `env.REDIS_URL` and the `ioredis` dependency are wired in; add a cache-aside read in `DataGridService.list()` keyed by `resource + JSON.stringify(query) + gridScope` with a short TTL (30–60s) for high-traffic read endpoints. Not enabled by default because cache invalidation strategy is application-specific (tag by resource, flush on writes).
- **Virtualization extension point**: swap the `<tbody>` row mapping in `DataGrid.jsx` for `@tanstack/react-virtual` when a single page can exceed ~500 rendered rows (e.g. if you raise `MAX_PAGE_SIZE` for a "load more" / infinite-scroll UX).

---

## Environment Variables

**Backend (`backend/.env`)**

| Variable | Default | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | Controls verbose logging, stack traces, CSP |
| `PORT` | `5000` | Standalone demo server port |
| `MONGO_URI` | — | Standalone demo Mongo connection (host apps pass their own existing connection) |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allow-list |
| `REDIS_URL` | — | Optional; enables the caching extension point |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | `60000` / `300` | Read-endpoint rate limiting |
| `EXPORT_MAX_ROWS` | `50000` | Hard cap per export request |
| `MAX_PAGE_SIZE` | `500` | Hard cap on `?limit=` |

**Frontend (`frontend/.env`)**

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Base URL for `apiClient` |

---

## Deployment Guide

1. **Backend**: this module exports `createApp()` (Express app, no `listen()`)
   from the demo `app.js` as a reference — in a real host app, mount
   `buildDataGridRouter(...)` directly on your existing Express app instead of
   using the standalone `server.js`/`app.js` at all.
2. Ensure `NODE_ENV=production` — disables verbose error details and dev CSP relaxation.
3. Put the API behind your existing reverse proxy / load balancer; this module
   assumes TLS termination happens upstream.
4. Build the frontend with `npm run build` (Vite) and serve the static bundle
   from your existing frontend hosting/CDN; set `VITE_API_BASE_URL` to your
   production API origin at build time.
5. If enabling Redis caching, provision a managed Redis instance and set `REDIS_URL`.
6. Add real MongoDB indexes for every `filterable`/`sortable`/`searchable` field
   you register, mirroring `employee.model.js`.

---

## Production Checklist

- [ ] Replace `demoAuthenticate` / `demoRowScope` with your real auth middleware and tenant/row scoping
- [ ] Remove `modules/example/*` (the Employee demo resource) or keep only as reference
- [ ] Add compound indexes for every filterable/sortable field per registered collection
- [ ] Set `CORS_ORIGINS` to your real frontend origin(s) only
- [ ] Set conservative `RATE_LIMIT_MAX` / `EXPORT_MAX_ROWS` for your traffic profile
- [ ] Wire audit logging into `DataGridService` create/update/delete/bulk methods
- [ ] Decide and implement your Saved Views persistence (server-side, per the Roadmap)
- [ ] Load-test list endpoints against production-scale collections; add Redis caching if needed
- [ ] Confirm `select: false` is set on every sensitive field (password hashes, tokens, etc.) in every `fieldsConfig`
- [ ] Run `npm audit` on both `backend` and `frontend` before shipping

---

## Roadmap / Extension Guide

These are intentionally left as extension points rather than implemented, since
each is genuinely application-specific:

| Feature | Where to add it |
|---|---|
| **Server-side Saved Views** (shared across users) | New `savedView.model.js` + a `datagrid.savedviews.routes.js` following the exact same routes→controller→service→repository pattern as `modules/datagrid/`; frontend already has all the state (`state.filters/sort/columnVisibility/density`) needed to serialize |
| **Import (CSV/Excel)** | New route `POST /:resource/import` using `fast-csv`/`ExcelJS` to parse, `express-validator` per-row, and a dry-run/preview mode before committing via `bulkUpdate`-style writes |
| **Column drag-to-reorder** | `state.columnOrder` already exists in `useDataGrid`; wire a drag library (e.g. `@dnd-kit/sortable`) in `DataGridToolbar`/table headers and call `setColumnOrder` |
| **Group-by / collapsible groups** | TanStack Table supports grouping natively; add `getGroupedRowModel()` and a `groupBy` param that the Query Builder turns into an aggregation pipeline (`$group`) instead of `find()` |
| **Infinite scroll / virtualized rows** | Swap manual pagination for `@tanstack/react-virtual` over an ever-growing `data` array fetched via `limit`/`skip` continuation |
| **Redis caching** | Cache-aside in `DataGridService.list()`, see [Performance Optimizations](#performance-optimizations) |
| **Audit logging** | Call your logger at the top of `DataGridService.create/update/remove/bulkUpdate/bulkDelete` |

---

## License

MIT — adapt freely for internal or commercial use.
