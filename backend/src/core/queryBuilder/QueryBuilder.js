import lodash from 'lodash';
import ApiError from '../utils/ApiError.js';

const { escapeRegExp, isPlainObject } = lodash;

/**
 * QueryBuilder
 * ------------
 * A collection-agnostic translator from a sanitized "grid request" (search,
 * filters, sort, pagination, field selection) into a Mongoose query.
 *
 * It NEVER trusts raw client input directly — every field name and operator
 * is checked against the module's declarative `fieldsConfig` (the allow-list
 * defined by the developer integrating the grid). This is what prevents
 * NoSQL injection, mass field exposure, and query-based DoS.
 *
 * Usage:
 *   const qb = new QueryBuilder(Model, fieldsConfig, request.query)
 *     .applySearch()
 *     .applyFilters()
 *     .applySort()
 *     .applyFieldSelection()
 *     .applyPagination();
 *   const { data, meta } = await qb.execute();
 */

const MONGO_OPERATORS = new Set([
  'eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'exists', 'between', 'contains',
]);

export class QueryBuilder {
  /**
   * @param {import('mongoose').Model} model
   * @param {object} fieldsConfig - map of fieldKey -> { path, type, filterable, sortable, searchable, select }
   * @param {object} rawQuery - already-parsed request query object (post express-validator)
   * @param {object} [options]
   * @param {object} [options.baseFilter] - Mandatory server-injected filter (e.g. tenant/org/permission scoping). Always ANDed in and cannot be overridden by the client.
   * @param {number} [options.maxPageSize=500]
   */
  constructor(model, fieldsConfig, rawQuery = {}, options = {}) {
    this.model = model;
    this.fieldsConfig = fieldsConfig;
    this.rawQuery = rawQuery;
    this.baseFilter = options.baseFilter || {};
    this.maxPageSize = options.maxPageSize || 500;

    this.mongoFilter = {};
    this.sortSpec = {};
    this.projection = null;
    this.page = 1;
    this.limit = 25;
    this.populatePaths = [];
  }

  // ---- helpers -------------------------------------------------------

  _resolveField(key) {
    const field = this.fieldsConfig[key];
    if (!field) {
      throw ApiError.badRequest(`Unknown or non-filterable field: "${key}"`);
    }
    return field;
  }

  _castValue(field, value) {
    switch (field.type) {
      case 'number': {
        const n = Number(value);
        if (Number.isNaN(n)) throw ApiError.badRequest(`Field "${field.path}" expects a number`);
        return n;
      }
      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (value === 'true') return true;
        if (value === 'false') return false;
        throw ApiError.badRequest(`Field "${field.path}" expects a boolean`);
      case 'date': {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) throw ApiError.badRequest(`Field "${field.path}" expects a valid date`);
        return d;
      }
      case 'objectId':
      case 'string':
      default:
        return String(value);
    }
  }

  // ---- global search ---------------------------------------------------

  applySearch() {
    const term = this.rawQuery.search;
    if (!term || typeof term !== 'string' || !term.trim()) return this;

    const searchableFields = Object.values(this.fieldsConfig).filter((f) => f.searchable);
    if (searchableFields.length === 0) return this;

    const safe = escapeRegExp(term.trim()).slice(0, 200);
    const regex = new RegExp(safe, 'i');

    const or = searchableFields.map((f) => ({ [f.path]: regex }));
    this._and(or.length === 1 ? or[0] : { $or: or });
    return this;
  }

  // ---- structured filters ----------------------------------------------

  /**
   * Expects filters as: filters[fieldKey][operator]=value  (parsed to nested object by express)
   * or a JSON-encoded `filters` query param — both are supported.
   */
  applyFilters() {
    let filters = this.rawQuery.filters;

    if (typeof filters === 'string') {
      try {
        filters = JSON.parse(filters);
      } catch {
        throw ApiError.badRequest('filters must be valid JSON');
      }
    }

    if (!filters || !isPlainObject(filters)) return this;

    for (const [key, spec] of Object.entries(filters)) {
      const field = this._resolveField(key);
      if (!field.filterable) {
        throw ApiError.badRequest(`Field "${key}" is not filterable`);
      }

      if (!isPlainObject(spec)) {
        // shorthand: filters[status]=active  -> equality
        this._and({ [field.path]: this._castValue(field, spec) });
        continue;
      }

      const clause = {};
      for (const [op, value] of Object.entries(spec)) {
        if (!MONGO_OPERATORS.has(op)) {
          throw ApiError.badRequest(`Unsupported filter operator "${op}" for field "${key}"`);
        }

        switch (op) {
          case 'in':
          case 'nin': {
            const arr = Array.isArray(value) ? value : String(value).split(',');
            clause[`$${op}`] = arr.map((v) => this._castValue(field, v));
            break;
          }
          case 'between': {
            const [from, to] = Array.isArray(value) ? value : String(value).split(',');
            if (from !== undefined && from !== '') clause.$gte = this._castValue(field, from);
            if (to !== undefined && to !== '') clause.$lte = this._castValue(field, to);
            break;
          }
          case 'contains': {
            const safe = escapeRegExp(String(value)).slice(0, 200);
            clause.$regex = safe;
            clause.$options = 'i';
            break;
          }
          case 'exists':
            clause.$exists = value === true || value === 'true';
            break;
          default:
            clause[`$${op}`] = this._castValue(field, value);
        }
      }
      this._and({ [field.path]: clause });
    }

    return this;
  }

  /** Explicit date-range convenience, e.g. dateFrom/dateTo on a designated field key. */
  applyDateRange(fieldKey = 'createdAt', fromKey = 'dateFrom', toKey = 'dateTo') {
    const from = this.rawQuery[fromKey];
    const to = this.rawQuery[toKey];
    if (!from && !to) return this;

    const field = this._resolveField(fieldKey);
    const clause = {};
    if (from) clause.$gte = this._castValue(field, from);
    if (to) clause.$lte = this._castValue(field, to);
    this._and({ [field.path]: clause });
    return this;
  }

  _and(clause) {
    this.mongoFilter = this.mongoFilter.$and
      ? { $and: [...this.mongoFilter.$and, clause] }
      : Object.keys(this.mongoFilter).length
        ? { $and: [this.mongoFilter, clause] }
        : clause;
  }

  // ---- sorting -----------------------------------------------------------

  applySort() {
    const { sort } = this.rawQuery;
    if (!sort) {
      const defaultSortField = Object.values(this.fieldsConfig).find((f) => f.defaultSort);
      if (defaultSortField) {
        this.sortSpec = { [defaultSortField.path]: defaultSortField.defaultSort === 'desc' ? -1 : 1 };
      } else {
        this.sortSpec = { _id: -1 };
      }
      return this;
    }

    // sort=field1:asc,field2:desc  (multi-column sort)
    const parts = String(sort).split(',').map((s) => s.trim()).filter(Boolean);
    const spec = {};
    for (const part of parts) {
      const [key, dirRaw] = part.split(':');
      const field = this._resolveField(key);
      if (!field.sortable) throw ApiError.badRequest(`Field "${key}" is not sortable`);
      const dir = (dirRaw || 'asc').toLowerCase() === 'desc' ? -1 : 1;
      spec[field.path] = dir;
    }
    this.sortSpec = Object.keys(spec).length ? spec : { _id: -1 };
    return this;
  }

  // ---- field selection / projection (mass-assignment / over-exposure guard) ----

  applyFieldSelection() {
    const requested = this.rawQuery.fields;
    const selectable = Object.values(this.fieldsConfig).filter((f) => f.select !== false);

    if (!requested) {
      this.projection = selectable.map((f) => f.path).join(' ');
      return this;
    }

    const requestedKeys = String(requested).split(',').map((s) => s.trim()).filter(Boolean);
    const allowed = requestedKeys.filter((k) => this.fieldsConfig[k] && this.fieldsConfig[k].select !== false);
    if (allowed.length === 0) {
      this.projection = selectable.map((f) => f.path).join(' ');
      return this;
    }
    this.projection = allowed.map((k) => this.fieldsConfig[k].path).join(' ');
    return this;
  }

  // ---- pagination --------------------------------------------------------

  applyPagination() {
    const page = Math.max(1, Number.parseInt(this.rawQuery.page, 10) || 1);
    let limit = Number.parseInt(this.rawQuery.limit, 10) || 25;
    limit = Math.min(Math.max(1, limit), this.maxPageSize);
    this.page = page;
    this.limit = limit;
    return this;
  }

  populate(paths) {
    this.populatePaths = Array.isArray(paths) ? paths : [paths];
    return this;
  }

  // ---- execution -----------------------------------------------------

  _finalFilter() {
    const clauses = [];
    if (Object.keys(this.baseFilter).length) clauses.push(this.baseFilter);
    if (Object.keys(this.mongoFilter).length) clauses.push(this.mongoFilter);
    if (clauses.length === 0) return {};
    if (clauses.length === 1) return clauses[0];
    return { $and: clauses };
  }

  async execute() {
    const filter = this._finalFilter();
    const skip = (this.page - 1) * this.limit;

    let query = this.model
      .find(filter, this.projection)
      .sort(this.sortSpec)
      .skip(skip)
      .limit(this.limit)
      .lean();

    for (const path of this.populatePaths) {
      query = query.populate(path);
    }

    const [data, totalRecords] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        totalRecords,
        totalPages: Math.max(1, Math.ceil(totalRecords / this.limit)),
        hasNextPage: skip + data.length < totalRecords,
        hasPrevPage: this.page > 1,
        sort: this.sortSpec,
        filter,
      },
    };
  }

  /** Returns the raw filter without executing — useful for bulk operations / exports that reuse the same grid state. */
  getFilter() {
    return this._finalFilter();
  }

  getSort() {
    return this.sortSpec;
  }
}

export default QueryBuilder;
