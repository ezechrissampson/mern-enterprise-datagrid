import React from 'react';

export function BulkActionsBar({ count, actions = [], onAction, onClear, onSelectAllMatching, totalRecords }) {
  if (count === 0) return null;

  return (
    <div className="d-flex flex-wrap align-items-center gap-2 p-2 mb-2 rounded-3 border" style={{ background: 'var(--dg-primary-light, #DCFCE7)' }}>
      <span className="fw-semibold small">{count} selected</span>
      {totalRecords > count && onSelectAllMatching && (
        <button type="button" className="btn btn-sm btn-link p-0" onClick={onSelectAllMatching}>
          Select all {totalRecords} matching records
        </button>
      )}
      <div className="vr mx-1 d-none d-sm-block" />
      <div className="d-flex flex-wrap gap-1">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            className={`btn btn-sm btn-${action.variant === 'danger' ? 'outline-danger' : 'outline-dark'}`}
            onClick={() => onAction(action)}
          >
            {action.icon && <i className={`bi ${action.icon} me-1`} />}
            {action.label}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-sm btn-link ms-auto" onClick={onClear}>
        Clear selection
      </button>
    </div>
  );
}

export default BulkActionsBar;
