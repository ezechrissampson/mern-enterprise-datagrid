import React from 'react';

export function EmptyState({ icon = 'bi-inbox', title = 'No records found', description, onReset }) {
  return (
    <div className="text-center py-5 text-secondary">
      <i className={`bi ${icon}`} style={{ fontSize: '2.5rem' }} />
      <h6 className="mt-3 mb-1 text-body">{title}</h6>
      {description && <p className="small mb-3">{description}</p>}
      {onReset && (
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onReset}>
          Reset filters
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong while loading data.', onRetry }) {
  return (
    <div className="text-center py-5">
      <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '2.5rem' }} />
      <h6 className="mt-3 mb-1">Failed to load data</h6>
      <p className="small text-secondary mb-3">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-danger" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default EmptyState;
