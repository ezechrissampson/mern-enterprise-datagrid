import React, { useState } from 'react';
import { FILTER_OPERATORS } from '../../utils/constants.js';

function FilterInput({ column, value, onChange }) {
  const type = column.filterType || column.type;

  if (type === 'select' && column.options) {
    return (
      <select className="form-select form-select-sm" value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">Any</option>
        {column.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (type === 'boolean') {
    return (
      <select
        className="form-select form-select-sm"
        value={value === undefined ? '' : String(value)}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value === 'true')}
      >
        <option value="">Any</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  if (type === 'date') {
    return (
      <input
        type="date"
        className="form-control form-control-sm"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (type === 'number') {
    return (
      <input
        type="number"
        className="form-control form-control-sm"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      />
    );
  }

  return (
    <input
      type="text"
      className="form-control form-control-sm"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Filter ${column.label}…`}
    />
  );
}

export function DataGridFilters({ columns, filters, onChangeFilter, onClearAll, open }) {
  const [operators, setOperators] = useState({});
  const filterable = columns.filter((c) => c.filterable);
  const activeCount = Object.keys(filters).length;

  if (!open) return null;

  return (
    <div className="border rounded-3 p-3 mb-3 bg-body-tertiary">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0 small text-uppercase text-secondary">Filters</h6>
        {activeCount > 0 && (
          <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={onClearAll}>
            Clear all ({activeCount})
          </button>
        )}
      </div>
      <div className="row g-2">
        {filterable.map((col) => {
          const op = operators[col.key] || (FILTER_OPERATORS[col.type]?.[0]?.value ?? 'eq');
          const currentSpec = filters[col.key];
          const currentValue = currentSpec && typeof currentSpec === 'object' ? currentSpec[op] : currentSpec;

          return (
            <div className="col-12 col-sm-6 col-lg-3" key={col.key}>
              <label className="form-label small mb-1 fw-semibold">{col.label}</label>
              <div className="d-flex gap-1">
                {FILTER_OPERATORS[col.type]?.length > 1 && (
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: 96 }}
                    value={op}
                    onChange={(e) => setOperators((prev) => ({ ...prev, [col.key]: e.target.value }))}
                  >
                    {FILTER_OPERATORS[col.type].map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                )}
                <FilterInput
                  column={col}
                  value={currentValue}
                  onChange={(val) => onChangeFilter(col.key, val === undefined ? undefined : { [op]: val })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FilterChips({ columns, filters, onRemove }) {
  const entries = Object.entries(filters);
  if (entries.length === 0) return null;

  const labelFor = (key) => columns.find((c) => c.key === key)?.label || key;

  return (
    <div className="d-flex flex-wrap gap-2 mb-2">
      {entries.map(([key, spec]) => {
        const val = typeof spec === 'object' ? Object.values(spec)[0] : spec;
        return (
          <span key={key} className="badge rounded-pill text-bg-light border d-flex align-items-center gap-1">
            {labelFor(key)}: {String(val)}
            <button
              type="button"
              className="btn-close btn-close-sm"
              style={{ fontSize: '0.6rem' }}
              aria-label={`Remove ${labelFor(key)} filter`}
              onClick={() => onRemove(key)}
            />
          </span>
        );
      })}
    </div>
  );
}

export default DataGridFilters;
