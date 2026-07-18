import React from 'react';

export function ColumnVisibilityMenu({ columns, columnVisibility, onToggle, onReset }) {
  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="bi bi-layout-three-columns me-1" />
        Columns
      </button>
      <div className="dropdown-menu p-2" style={{ minWidth: 220, maxHeight: 320, overflowY: 'auto' }}>
        {columns.map((col) => (
          <div className="form-check" key={col.key}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`col-vis-${col.key}`}
              checked={columnVisibility[col.key] !== false}
              onChange={() => onToggle(col.key)}
            />
            <label className="form-check-label small" htmlFor={`col-vis-${col.key}`}>
              {col.label}
            </label>
          </div>
        ))}
        <hr className="my-2" />
        <button type="button" className="btn btn-sm btn-link p-0" onClick={onReset}>
          Restore defaults
        </button>
      </div>
    </div>
  );
}

export default ColumnVisibilityMenu;
