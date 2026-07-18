import React from 'react';
import ColumnVisibilityMenu from './ColumnVisibilityMenu.jsx';
import { DENSITY_OPTIONS, EXPORT_FORMATS } from '../../utils/constants.js';

export function DataGridToolbar({
  config,
  search,
  onSearch,
  filtersOpen,
  onToggleFilters,
  activeFilterCount,
  columns,
  columnVisibility,
  onToggleColumn,
  onResetColumns,
  density,
  onChangeDensity,
  onExport,
  canExport,
  selectionCount,
}) {
  return (
    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
      <div className="position-relative flex-grow-1" style={{ minWidth: 220, maxWidth: 360 }}>
        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-secondary" />
        <input
          type="search"
          className="form-control form-control-sm ps-4"
          placeholder={config.searchPlaceholder || 'Search…'}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search records"
        />
      </div>

      <button
        type="button"
        className={`btn btn-sm ${activeFilterCount ? 'btn-primary' : 'btn-outline-secondary'}`}
        onClick={onToggleFilters}
        aria-pressed={filtersOpen}
      >
        <i className="bi bi-funnel me-1" />
        Filters
        {activeFilterCount > 0 && <span className="badge text-bg-light ms-1">{activeFilterCount}</span>}
      </button>

      <ColumnVisibilityMenu
        columns={columns}
        columnVisibility={columnVisibility}
        onToggle={onToggleColumn}
        onReset={onResetColumns}
      />

      <div className="btn-group btn-group-sm" role="group" aria-label="Density">
        {DENSITY_OPTIONS.map((d) => (
          <button
            key={d.value}
            type="button"
            className={`btn ${density === d.value ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => onChangeDensity(d.value)}
            title={d.label}
          >
            <i className="bi bi-list" />
          </button>
        ))}
      </div>

      {canExport && (
        <div className="dropdown ms-auto">
          <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
            <i className="bi bi-download me-1" />
            Export
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            {(config.exportFormats || EXPORT_FORMATS.map((f) => f.value)).map((fmt) => (
              <li key={fmt}>
                <button type="button" className="dropdown-item" onClick={() => onExport(fmt, 'filtered')}>
                  <i className={`bi ${EXPORT_FORMATS.find((f) => f.value === fmt)?.icon} me-2`} />
                  Export filtered as {fmt.toUpperCase()}
                </button>
              </li>
            ))}
            {selectionCount > 0 && (
              <>
                <li><hr className="dropdown-divider" /></li>
                {(config.exportFormats || EXPORT_FORMATS.map((f) => f.value)).map((fmt) => (
                  <li key={`sel-${fmt}`}>
                    <button type="button" className="dropdown-item" onClick={() => onExport(fmt, 'selected')}>
                      Export {selectionCount} selected as {fmt.toUpperCase()}
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DataGridToolbar;
