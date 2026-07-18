import { getResource } from './datagrid.registry.js';
import DataGridRepository from './datagrid.repository.js';
import ApiError from '../../core/utils/ApiError.js';
import env from '../../config/env.js';

/**
 * Service layer: business rules, permission-aware bulk-op guards, and
 * orchestration between repository calls. Controllers stay thin.
 */
export class DataGridService {
  constructor(resourceName) {
    this.resource = getResource(resourceName);
    this.repo = new DataGridRepository(this.resource);
  }

  async list(query, gridScope = {}) {
    return this.repo.list(query, { baseFilter: gridScope, maxPageSize: env.MAX_PAGE_SIZE });
  }

  async getOne(id) {
    return this.repo.findById(id);
  }

  async create(data) {
    return this.repo.create(data);
  }

  async update(id, data) {
    return this.repo.updateById(id, data);
  }

  async remove(id) {
    return this.repo.deleteById(id);
  }

  /**
   * Bulk operations always re-apply the row-level `gridScope` filter so a
   * user cannot mutate/delete records outside their permission scope purely
   * by supplying arbitrary IDs (IDOR / parameter tampering protection).
   */
  async bulkUpdate(ids, patch, gridScope = {}) {
    this._assertIds(ids);
    return this.repo.bulkUpdate(ids, patch, gridScope);
  }

  async bulkDelete(ids, gridScope = {}) {
    this._assertIds(ids);
    return this.repo.bulkDelete(ids, gridScope);
  }

  async forExport(query, gridScope = {}) {
    return this.repo.findForExport(query, { baseFilter: gridScope, maxRows: env.EXPORT_MAX_ROWS });
  }

  _assertIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw ApiError.badRequest('ids must be a non-empty array');
    }
    if (ids.length > 5000) {
      throw ApiError.badRequest('Bulk operation exceeds maximum of 5000 records at once');
    }
  }
}

export default DataGridService;
