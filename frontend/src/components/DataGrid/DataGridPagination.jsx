import React from 'react';
import { PAGE_SIZE_OPTIONS } from '../../utils/constants.js';

export function DataGridPagination({ meta, limit, onPageChange, onLimitChange }) {
  if (!meta) return null;
  const { page, totalPages, totalRecords } = meta;
  const startRecord = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalRecords);

  const [goTo, setGoTo] = React.useState('');

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
      <div className="d-flex align-items-center gap-2">
        <span className="small text-secondary">
          Showing {startRecord}-{endRecord} of {totalRecords}
        </span>
        <select
          className="form-select form-select-sm"
          style={{ width: 90 }}
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          aria-label="Rows per page"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>

      <nav aria-label="Pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
            <button type="button" className="page-link" onClick={() => onPageChange(1)} aria-label="First page">«</button>
          </li>
          <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
            <button type="button" className="page-link" onClick={() => onPageChange(page - 1)} aria-label="Previous page">‹</button>
          </li>
          <li className="page-item disabled">
            <span className="page-link">Page {page} of {totalPages}</span>
          </li>
          <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
            <button type="button" className="page-link" onClick={() => onPageChange(page + 1)} aria-label="Next page">›</button>
          </li>
          <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
            <button type="button" className="page-link" onClick={() => onPageChange(totalPages)} aria-label="Last page">»</button>
          </li>
        </ul>
      </nav>

      <form
        className="d-flex align-items-center gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(goTo);
          if (n >= 1 && n <= totalPages) onPageChange(n);
          setGoTo('');
        }}
      >
        <label className="small text-secondary mb-0" htmlFor="dg-goto-page">Go to</label>
        <input
          id="dg-goto-page"
          type="number"
          min={1}
          max={totalPages}
          className="form-control form-control-sm"
          style={{ width: 70 }}
          value={goTo}
          onChange={(e) => setGoTo(e.target.value)}
        />
      </form>
    </div>
  );
}

export default DataGridPagination;
