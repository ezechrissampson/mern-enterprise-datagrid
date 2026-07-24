import React, { useEffect, useState } from 'react';
import savedViewService from '../services/savedViewService.js';
import { listGridConfigs, getGridConfig } from '../config/registry.js';

function applyViewAndNavigate(view) {
  const config = getGridConfig(view.resource);
  if (!config) return;

  const persisted = {
    limit: view.pageSize || config.defaultPageSize,
    sort: view.sort || [],
    search: '',
    filters: view.filters || {},
    columnVisibility: view.columnVisibility || {},
    columnOrder: [],
    pinnedColumns: [],
    density: view.density || 'comfortable',
  };

  try {
    window.localStorage.setItem(config.storageKey, JSON.stringify(persisted));
  } catch {
    /* storage unavailable — non-fatal, grid will just open with defaults */
  }

  // Full navigation (not client-side routing) so useDataGrid re-reads the
  // freshly-written localStorage state on mount.
  window.location.href = `/datagrid/${view.resource}`;
}

export function SavedViewsPage() {
  const availableResources = listGridConfigs();
  const [resource, setResource] = useState(availableResources[0]?.resource || '');
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadViews = React.useCallback(() => {
    if (!resource) return;
    setLoading(true);
    setError(null);
    savedViewService
      .list(resource)
      .then((res) => setViews(res.data))
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [resource]);

  useEffect(() => {
    loadViews();
  }, [loadViews]);

  async function handleDelete(view) {
    if (!window.confirm(`Delete saved view "${view.name}"?`)) return;
    await savedViewService.remove(view._id);
    loadViews();
  }

  async function handleSetDefault(view) {
    await savedViewService.setDefault(view._id);
    loadViews();
  }

  async function handleToggleShared(view) {
    await savedViewService.update(view._id, { isShared: !view.isShared });
    loadViews();
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">Saved Views</h4>
          <p className="text-secondary small mb-0">
            Reusable filter, sort, and column layouts. Personal views are visible only to you; shared views are visible to everyone on this resource.
          </p>
        </div>
        <select className="form-select form-select-sm" style={{ width: 220 }} value={resource} onChange={(e) => setResource(e.target.value)}>
          {availableResources.map((cfg) => (
            <option key={cfg.resource} value={cfg.resource}>{cfg.title}</option>
          ))}
        </select>
      </div>

      {loading && <div className="text-secondary small">Loading saved views…</div>}
      {error && <div className="alert alert-danger small">{error}</div>}

      {!loading && !error && views.length === 0 && (
        <div className="text-center text-secondary py-5">
          <i className="bi bi-bookmark" style={{ fontSize: '2rem' }} />
          <p className="mt-2 mb-0">No saved views yet for this resource.</p>
          <p className="small">Open the grid, set up your filters/columns, then use "Save view" in the toolbar.</p>
        </div>
      )}

      <div className="row g-3">
        {views.map((view) => (
          <div className="col-12 col-md-6 col-lg-4" key={view._id}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="mb-0">{view.name}</h6>
                  {view.isDefault && <span className="badge text-bg-success">Default</span>}
                </div>
                <div className="small text-secondary mb-3">
                  {Object.keys(view.filters || {}).length} filter(s) · {(view.sort || []).length} sort field(s) · {view.density}
                  {view.isShared && (
                    <>
                      {' '}· <span className="text-primary"><i className="bi bi-people-fill" /> Shared</span>
                    </>
                  )}
                </div>
                <div className="mt-auto d-flex flex-wrap gap-1">
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => applyViewAndNavigate(view)}>
                    <i className="bi bi-box-arrow-in-right me-1" /> Apply
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleSetDefault(view)} disabled={view.isDefault}>
                    Set default
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleToggleShared(view)}>
                    {view.isShared ? 'Unshare' : 'Share'}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(view)}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedViewsPage;
