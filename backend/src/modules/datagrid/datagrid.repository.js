import { QueryBuilder } from '../../core/queryBuilder/QueryBuilder.js';
import ApiError from '../../core/utils/ApiError.js';

/**
 * Repository layer: the only layer that talks to Mongoose directly.
 * Keeps persistence concerns out of the service/controller layers.
 */
export class DataGridRepository {
  constructor(resource) {
    this.model = resource.model;
    this.fieldsConfig = resource.fieldsConfig;
    this.populatePaths = resource.populate || [];
  }

  buildQuery(query, { baseFilter, maxPageSize } = {}) {
    const qb = new QueryBuilder(this.model, this.fieldsConfig, query, { baseFilter, maxPageSize });
    qb.applySearch().applyFilters().applySort().applyFieldSelection().applyPagination();
    if (this.populatePaths.length) qb.populate(this.populatePaths);
    return qb;
  }

  async list(query, opts) {
    const qb = this.buildQuery(query, opts);
    return qb.execute();
  }

  async findById(id) {
    let q = this.model.findById(id).lean();
    for (const p of this.populatePaths) q = q.populate(p);
    const doc = await q.exec();
    if (!doc) throw ApiError.notFound('Record not found');
    return doc;
  }

  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject();
  }

  async updateById(id, data) {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    if (!doc) throw ApiError.notFound('Record not found');
    return doc;
  }

  async deleteById(id) {
    const doc = await this.model.findByIdAndDelete(id).lean();
    if (!doc) throw ApiError.notFound('Record not found');
    return doc;
  }

  async bulkUpdate(ids, patch, baseFilter = {}) {
    const filter = { _id: { $in: ids }, ...baseFilter };
    const result = await this.model.updateMany(filter, patch, { runValidators: true });
    return { matched: result.matchedCount ?? result.n, modified: result.modifiedCount ?? result.nModified };
  }

  async bulkDelete(ids, baseFilter = {}) {
    const filter = { _id: { $in: ids }, ...baseFilter };
    const result = await this.model.deleteMany(filter);
    return { deleted: result.deletedCount };
  }

  /** Used by export: streams matching docs without pagination, capped by maxRows. */
  async findForExport(query, { baseFilter, maxRows } = {}) {
    const qb = new QueryBuilder(this.model, this.fieldsConfig, query, { baseFilter, maxPageSize: maxRows });
    qb.applySearch().applyFilters().applySort().applyFieldSelection();
    let filter = qb.getFilter();

    // "Export selected" support: ?ids=<comma-separated Mongo _ids> restricts
    // the export to exactly those records (baseFilter/gridScope above still
    // applies, so a user cannot export records outside their permission scope).
    if (query.ids) {
      const ids = String(query.ids).split(',').map((s) => s.trim()).filter(Boolean);
      filter = Object.keys(filter).length ? { $and: [filter, { _id: { $in: ids } }] } : { _id: { $in: ids } };
    }

    let q = this.model.find(filter, qb.projection).sort(qb.getSort()).limit(maxRows).lean();
    for (const p of this.populatePaths) q = q.populate(p);
    return q.exec();
  }
}

export default DataGridRepository;
