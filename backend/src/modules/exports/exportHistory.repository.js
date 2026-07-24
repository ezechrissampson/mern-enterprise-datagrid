import ExportHistory from './exportHistory.model.js';
import ApiError from '../../core/utils/ApiError.js';

export class ExportHistoryRepository {
  async create(data) {
    const doc = await ExportHistory.create(data);
    return doc.toObject();
  }

  /** Lists history, scoped to the requesting user unless they're an admin (isAdmin=true shows all). */
  async list({ requestedBy, isAdmin, resource, page = 1, limit = 25 }) {
    const filter = {};
    if (!isAdmin) filter.requestedBy = requestedBy;
    if (resource) filter.resource = resource;

    const skip = (page - 1) * limit;
    const [data, totalRecords] = await Promise.all([
      ExportHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ExportHistory.countDocuments(filter),
    ]);

    return {
      data,
      meta: { page, limit, totalRecords, totalPages: Math.max(1, Math.ceil(totalRecords / limit)) },
    };
  }

  async findById(id) {
    const doc = await ExportHistory.findById(id).lean();
    if (!doc) throw ApiError.notFound('Export record not found');
    return doc;
  }

  async deleteById(id) {
    const doc = await ExportHistory.findByIdAndDelete(id).lean();
    if (!doc) throw ApiError.notFound('Export record not found');
    return doc;
  }
}

export default ExportHistoryRepository;
