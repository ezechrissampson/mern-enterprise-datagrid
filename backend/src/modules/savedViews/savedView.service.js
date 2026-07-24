import SavedViewRepository from './savedView.repository.js';
import ApiError from '../../core/utils/ApiError.js';

const ALLOWED_FIELDS = ['resource', 'name', 'isShared', 'filters', 'sort', 'columnVisibility', 'density', 'pageSize'];

function pickAllowed(body) {
  const clean = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) clean[key] = body[key];
  }
  return clean;
}

export class SavedViewService {
  constructor() {
    this.repo = new SavedViewRepository();
  }

  list(resource, user) {
    return this.repo.listForUser(resource, user.id);
  }

  async create(body, user) {
    const data = pickAllowed(body);
    if (!data.resource || !data.name) {
      throw ApiError.badRequest('resource and name are required');
    }
    data.owner = user.id;
    return this.repo.create(data);
  }

  async update(id, body, user) {
    const existing = await this.repo.findById(id);
    this._assertOwner(existing, user);
    const data = pickAllowed(body);
    delete data.resource; // resource is immutable after creation
    return this.repo.updateById(id, data);
  }

  async remove(id, user) {
    const existing = await this.repo.findById(id);
    this._assertOwner(existing, user);
    return this.repo.deleteById(id);
  }

  async setDefault(id, user) {
    const existing = await this.repo.findById(id);
    this._assertOwner(existing, user);
    await this.repo.clearDefault(existing.resource, user.id);
    return this.repo.updateById(id, { isDefault: true });
  }

  _assertOwner(view, user) {
    const isAdmin = user?.isSuperAdmin || (user?.permissions || []).includes('*');
    if (!isAdmin && view.owner !== user.id) {
      throw ApiError.forbidden('You can only modify your own saved views');
    }
  }
}

export default SavedViewService;
