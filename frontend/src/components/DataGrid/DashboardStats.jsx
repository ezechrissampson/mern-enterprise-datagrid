import React from 'react';

const CARD_DEFS = [
  { key: 'totalRecords', label: 'Total Records', icon: 'bi-database' },
  { key: 'filteredRecords', label: 'Filtered Records', icon: 'bi-funnel' },
  { key: 'selectedRecords', label: 'Selected Records', icon: 'bi-check2-square' },
  { key: 'exportCount', label: 'Exports (session)', icon: 'bi-download' },
];

/**
 * Small stat-card row summarizing the current grid state. Pass values
 * derived from a useDataGrid() instance's `meta` and `state`.
 */
export function DashboardStats({ totalRecords = 0, filteredRecords = 0, selectedRecords = 0, exportCount = 0 }) {
  const values = { totalRecords, filteredRecords, selectedRecords, exportCount };

  return (
    <div className="row g-3 mb-4">
      {CARD_DEFS.map((card) => (
        <div className="col-6 col-lg-3" key={card.key}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 44, height: 44, background: 'var(--dg-primary-light)' }}
              >
                <i className={`bi ${card.icon}`} style={{ color: 'var(--dg-primary-dark)' }} />
              </div>
              <div>
                <div className="fs-4 fw-semibold lh-1">{values[card.key].toLocaleString()}</div>
                <div className="small text-secondary">{card.label}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardStats;
