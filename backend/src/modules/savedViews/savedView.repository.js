import SavedView from './savedView.model.js';
import ApiError from '../../core/utils/ApiError.js';

export class SavedViewRepository {
  /** Views visible to this user for a resource: their own + anything shared. */
  async listForUser(resource, userId) {
    return SavedView.find({
      resource,
      $or: [{ owner: userId }, { isShared: true }],
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findById(id) {
    const doc = await SavedView.findById(id).lean();
    if (!doc) throw ApiError.notFound('Saved view not found');
    return doc;
  }

  async create(data) {
    const doc = await SavedView.create(data);
    return doc.toObject();
  }

  async updateById(id, data) {
    const doc = await SavedView.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    if (!doc) throw ApiError.notFound('Saved view not found');
    return doc;
  }

  async deleteById(id) {
    const doc = await SavedView.findByIdAndDelete(id).lean();
    if (!doc) throw ApiError.notFound('Saved view not found');
    return doc;
  }

  /** Unsets any existing default for this owner+resource before a new one is set. */
  async clearDefault(resource, owner) {
    await SavedView.updateMany({ resource, owner, isDefault: true }, { $set: { isDefault: false } });
  }
}

export default SavedViewRepository;
