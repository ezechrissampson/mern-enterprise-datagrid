import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import useDataGrid from '../../hooks/useDataGrid.js';
import datagridService from '../../services/datagridService.js';
import savedViewService from '../../services/savedViewService.js';
import DataGridToolbar from './DataGridToolbar.jsx';
import { DataGridFilters, FilterChips } from './DataGridFilters.jsx';
import BulkActionsBar from './BulkActionsBar.jsx';
import RowActionsMenu from './RowActionsMenu.jsx';
import DataGridPagination from './DataGridPagination.jsx';
import SkeletonLoader from './SkeletonLoader.jsx';
import { EmptyState, ErrorState } from './EmptyState.jsx';
import { formatCell } from '../../utils/formatters.js';
import { DENSITY_OPTIONS } from '../../utils/constants.js';

/**
 * <DataGrid config={...} permissions={...} onRowAction={...} onBulkAction={...} />
 *
 * The single reusable table component. Every feature is driven entirely by
 * `config` (see /src/config/example.config.js). No table-specific code
 * should live inside this file — new tables are built by writing a new
 * config object, never by copying this component.
 *
 * @param {object} props.config
 * @param {string[]} [props.userPermissions] - permission strings the current user holds; used to hide actions/buttons the user can't perform. If omitted, all actions render (host app should still enforce on the backend, which it does).
 * @param {(action: object, row: object) => void} props.onRowAction - called when a row action is clicked, other than the built-in delete which the grid handles itself when action.key === 'delete'.
 * @param {(action: object, ids: string[]) => void} [props.onBulkAction] - called for bulk actions the grid doesn't handle natively.
 */
export function DataGrid({ config, userPermissions, onRowAction, onBulkAction }) {
  const grid = useDataGrid(config);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [confirmState, setConfirmState] = useState(null); // { type: 'row'|'bulk', action, row? }
  const [saveViewOpen, setSaveViewOpen] = useState(false);

  const hasPermission = (perm) => !userPermissions || userPermissions.includes('*') || userPermissions.includes(perm);

  const densityRowHeight = DENSITY_OPTIONS.find((d) => d.value === grid.state.density)?.rowHeight || 44;

  // ---- TanStack Table (headless, manual/server-side mode) --------------

  const columns = useMemo(() => {
    const dataColumns = config.columns.map((col) => ({
      id: col.key,
      accessorKey: col.key,
      header: col.label,
      enableSorting: !!col.sortable,
      cell: (info) => {
        const value = info.getValue();
        if (col.badge && value in col.badge) {
          return <span className={`badge text-bg-${col.badge[value]}`}>{value}</span>;
        }
        return formatCell(value, col);
      },
    }));

    const selectColumn = {
      id: '__select',
      header: () => (
        <input
          type="checkbox"
          className="form-check-input"
          aria-label="Select all rows on page"
          checked={grid.data.length > 0 && grid.data.every((r) => grid.state.selection.includes(r._id))}
          onChange={() => (
            grid.data.every((r) => grid.state.selection.includes(r._id))
              ? grid.setSelection((sel) => sel.filter((id) => !grid.data.some((r) => r._id === id)))
              : grid.selectAllOnPage()
          )}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="form-check-input"
          aria-label={`Select row ${row.original._id}`}
          checked={grid.state.selection.includes(row.original._id)}
          onChange={() => grid.toggleRowSelected(row.original._id)}
        />
      ),
    };

    const actionsColumn = {
      id: '__actions',
      header: '',
      cell: ({ row }) => (
        <RowActionsMenu
          row={row.original}
          actions={(config.rowActions || []).filter((a) => hasPermission(config.permissions?.[a.key] || `${config.resource}:${a.key}`))}
          onAction={handleRowAction}
        />
      ),
    };

    return [selectColumn, ...dataColumns, actionsColumn];
  }, [config, grid.data, grid.state.selection]); // eslint-disable-line react-hooks/exhaustive-deps

  const table = useReactTable({
    data: grid.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row._id,
    state: {
      columnVisibility: grid.state.columnVisibility,
    },
    onColumnVisibilityChange: grid.setColumnVisibility,
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
  });

  // ---- action handlers ---------------------------------------------------

  function handleRowAction(action) {
    if (action.confirm) {
      setConfirmState({ type: 'row', action, row: action.__row });
      return;
    }
    onRowAction?.(action, action.__row);
  }

  // wrap RowActionsMenu's onAction(action,row) into handleRowAction(action) with row attached
  function onRowActionWrapper(action, row) {
    handleRowAction({ ...action, __row: row });
  }

  function handleBulkAction(action) {
    if (action.confirm) {
      setConfirmState({ type: 'bulk', action });
      return;
    }
    executeBulkAction(action);
  }

  async function executeBulkAction(action) {
    const ids = grid.state.selection;
    if (action.key === 'delete') {
      await datagridService.bulkDelete(config.resource, ids);
      grid.clearSelection();
      grid.refetch();
    } else if (action.patch) {
      await datagridService.bulkUpdate(config.resource, ids, action.patch);
      grid.clearSelection();
      grid.refetch();
    } else if (action.key === 'export') {
      handleExport('csv', 'selected');
    } else {
      onBulkAction?.(action, ids);
    }
    setConfirmState(null);
  }

  function handleExport(format, scope) {
    const params = { ...grid.queryParams, format };
    if (scope === 'selected') params.ids = grid.state.selection.join(',');
    window.open(datagridService.exportUrl(config.resource, params), '_blank', 'noopener');
  }

  async function handleSaveView(name, isShared) {
    await savedViewService.create({
      resource: config.resource,
      name,
      isShared,
      filters: grid.state.filters,
      sort: grid.state.sort,
      columnVisibility: grid.state.columnVisibility,
      density: grid.state.density,
      pageSize: grid.state.limit,
    });
    setSaveViewOpen(false);
  }

  const activeFilterCount = Object.keys(grid.state.filters).length;

  return (
    <div className="datagrid-root">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-0">{config.title}</h5>
          {config.description && <p className="text-secondary small mb-0">{config.description}</p>}
        </div>
      </div>

      <DataGridToolbar
        config={config}
        search={grid.state.search}
        onSearch={grid.setSearch}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((o) => !o)}
        activeFilterCount={activeFilterCount}
        columns={config.columns}
        columnVisibility={grid.state.columnVisibility}
        onToggleColumn={(key) => grid.setColumnVisibility((v) => ({ ...v, [key]: v[key] === false ? true : false }))}
        onResetColumns={() => grid.setColumnVisibility({})}
        density={grid.state.density}
        onChangeDensity={grid.setDensity}
        onExport={handleExport}
        canExport={hasPermission(config.permissions?.export)}
        selectionCount={grid.state.selection.length}
        onSaveView={() => setSaveViewOpen(true)}
      />

      <DataGridFilters
        open={filtersOpen}
        columns={config.columns}
        filters={grid.state.filters}
        onChangeFilter={grid.setFilter}
        onClearAll={grid.clearFilters}
      />

      <FilterChips columns={config.columns} filters={grid.state.filters} onRemove={(key) => grid.setFilter(key, undefined)} />

      <BulkActionsBar
        count={grid.state.selection.length}
        actions={(config.bulkActions || []).filter((a) => hasPermission(config.permissions?.[a.key] || `${config.resource}:${a.key}`))}
        onAction={handleBulkAction}
        onClear={grid.clearSelection}
        totalRecords={grid.meta?.totalRecords}
      />

      <div className="table-responsive border rounded-3">
        <table className="table table-hover align-middle mb-0 datagrid-table" style={{ '--dg-row-height': `${densityRowHeight}px` }}>
          <thead className="table-light sticky-top">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    role={header.column.getCanSort() ? 'button' : undefined}
                    onClick={header.column.getCanSort() ? (e) => grid.toggleSort(header.column.id, e.shiftKey) : undefined}
                    className="user-select-none"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <SortIndicator sort={grid.state.sort} columnId={header.column.id} />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {grid.loading ? (
            <SkeletonLoader columns={columns.length} rows={Math.min(grid.state.limit, 10)} />
          ) : (
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={grid.state.selection.includes(row.original._id) ? 'table-active' : ''}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={{ height: 'var(--dg-row-height)' }}>
                      {cell.column.id === '__actions'
                        ? <RowActionsMenu row={row.original} actions={(config.rowActions || []).filter((a) => hasPermission(config.permissions?.[a.key] || `${config.resource}:${a.key}`))} onAction={onRowActionWrapper} />
                        : flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>

        {!grid.loading && !grid.error && grid.data.length === 0 && (
          <EmptyState {...config.emptyState} onReset={activeFilterCount || grid.state.search ? grid.resetToDefaults : undefined} />
        )}
        {grid.error && <ErrorState message={grid.error} onRetry={grid.refetch} />}
      </div>

      <DataGridPagination
        meta={grid.meta}
        limit={grid.state.limit}
        onPageChange={grid.setPage}
        onLimitChange={grid.setLimit}
      />

      {saveViewOpen && (
        <SaveViewDialog
          onCancel={() => setSaveViewOpen(false)}
          onSave={handleSaveView}
        />
      )}

      {confirmState && (
        <ConfirmDialog
          title={`Confirm ${confirmState.action.label}`}
          message={
            confirmState.type === 'bulk'
              ? `This will ${confirmState.action.label.toLowerCase()} ${grid.state.selection.length} record(s). This cannot be undone.`
              : `This will ${confirmState.action.label.toLowerCase()} this record. This cannot be undone.`
          }
          onCancel={() => setConfirmState(null)}
          onConfirm={() => {
            if (confirmState.type === 'bulk') {
              executeBulkAction(confirmState.action);
            } else {
              onRowAction?.(confirmState.action, confirmState.row);
              setConfirmState(null);
            }
          }}
        />
      )}
    </div>
  );
}

function SortIndicator({ sort, columnId }) {
  const idx = sort.findIndex((s) => s.id === columnId);
  if (idx === -1) return <i className="bi bi-arrow-down-up ms-1 text-secondary opacity-50 small" />;
  const entry = sort[idx];
  return (
    <span className="ms-1 small">
      <i className={`bi ${entry.desc ? 'bi-arrow-down' : 'bi-arrow-up'}`} />
      {sort.length > 1 && <sup>{idx + 1}</sup>}
    </span>
  );
}

function SaveViewDialog({ onCancel, onSave }) {
  const [name, setName] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(name.trim(), isShared);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save view');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <form className="modal-content" onSubmit={submit}>
          <div className="modal-header">
            <h6 className="modal-title">Save current view</h6>
            <button type="button" className="btn-close" onClick={onCancel} aria-label="Close" />
          </div>
          <div className="modal-body">
            <label htmlFor="save-view-name" className="form-label small fw-semibold">View name</label>
            <input
              id="save-view-name"
              type="text"
              className="form-control form-control-sm mb-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Active Engineering employees"
              autoFocus
              required
            />
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="save-view-shared"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="save-view-shared">
                Share this view with everyone (otherwise it's only visible to you)
              </label>
            </div>
            {error && <div className="alert alert-danger small mt-3 mb-0">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-sm btn-primary" disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : 'Save view'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <div className="modal d-block" tabIndex={-1} role="dialog" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title">{title}</h6>
            <button type="button" className="btn-close" onClick={onCancel} aria-label="Close" />
          </div>
          <div className="modal-body">
            <p className="mb-0 small">{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCancel}>Cancel</button>
            <button type="button" className="btn btn-sm btn-danger" onClick={onConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataGrid;
