import ExportHistoryRepository from './exportHistory.repository.js';
import { resolveStoredPath, deleteStoredFile } from './storage.js';
import ApiError from '../../core/utils/ApiError.js';

export class ExportHistoryService {
  constructor() {
    this.repo = new ExportHistoryRepository();
  }

  /** Called by the DataGrid export endpoint right after a file is generated. */
  record(data) {
    return this.repo.create(data);
  }

  list(query, user) {
    const isAdmin = user?.isSuperAdmin || (user?.permissions || []).includes('*');
    return this.repo.list({
      requestedBy: user?.id,
      isAdmin,
      resource: query.resource,
      page: Math.max(1, Number.parseInt(query.page, 10) || 1),
      limit: Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 25)),
    });
  }

  async getDownload(id, user) {
    const record = await this.repo.findById(id);
    this._assertOwnership(record, user);
    return { record, filePath: resolveStoredPath(record.storedFilename) };
  }

  async remove(id, user) {
    const record = await this.repo.findById(id);
    this._assertOwnership(record, user);
    await deleteStoredFile(record.storedFilename);
    return this.repo.deleteById(id);
  }

  _assertOwnership(record, user) {
    const isAdmin = user?.isSuperAdmin || (user?.permissions || []).includes('*');
    if (!isAdmin && record.requestedBy !== user?.id) {
      throw ApiError.forbidden('You do not have access to this export');
    }
  }
}

export default ExportHistoryService;
