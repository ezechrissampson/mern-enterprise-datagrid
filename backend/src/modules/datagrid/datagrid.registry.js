import ApiError from '../../core/utils/ApiError.js';

/**
 * The DataGrid Resource Registry
 * ------------------------------
 * This is the ONLY place a developer integrating the module needs to touch
 * on the backend for a new collection/table. Register a Mongoose model
 * plus a declarative field map, and every generic endpoint
 * (list/search/sort/filter/bulk/export) works automatically.
 *
 * fieldsConfig entries:
 *   path        - the actual Mongoose document path (supports dot notation)
 *   type        - 'string' | 'number' | 'boolean' | 'date' | 'objectId'
 *   filterable  - allow this field in filters[]
 *   sortable    - allow this field in sort=
 *   searchable  - include in global text search ($or regex)
 *   select      - false to always exclude from projection (e.g. password hash)
 *   defaultSort - 'asc' | 'desc', used when no sort= is provided
 */
const registry = new Map();

export function registerResource(name, { model, fieldsConfig, permissions = {}, populate = [], bulkActions = [], rowActions = [] }) {
  if (!name || !model || !fieldsConfig) {
    throw new Error('registerResource requires: name, model, fieldsConfig');
  }
  registry.set(name, { model, fieldsConfig, permissions, populate, bulkActions, rowActions });
}

export function getResource(name) {
  const resource = registry.get(name);
  if (!resource) {
    throw ApiError.badRequest(`Unknown DataGrid resource: "${name}"`);
  }
  return resource;
}

export function listResources() {
  return Array.from(registry.keys());
}

export default { registerResource, getResource, listResources };
