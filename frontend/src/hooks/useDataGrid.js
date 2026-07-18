import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import datagridService from '../services/datagridService.js';
import useDebounce from './useDebounce.js';

const DEFAULT_STATE = {
  page: 1,
  limit: 25,
  sort: [],
  search: '',
  filters: {},
  columnVisibility: {},
  columnOrder: [],
  pinnedColumns: [],
  density: 'comfortable',
  selection: [],
};

function loadPersisted(storageKey) {
  if (!storageKey) return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(storageKey, state) {
  if (!storageKey) return;
  try {
    const { page, selection, ...persistable } = state; // eslint-disable-line no-unused-vars
    window.localStorage.setItem(storageKey, JSON.stringify(persistable));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

function serializeSort(sort) {
  if (!sort?.length) return undefined;
  return sort.map((s) => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(',');
}

/**
 * useDataGrid
 * -----------
 * Owns all grid state (pagination, sorting, search, filters, column
 * preferences, density, selection) and fetches data from the generic
 * backend endpoint for the given `resource`. This is the single hook a
 * DataGrid component instance needs.
 *
 * @param {object} config - see /frontend/src/config/example.config.js for shape
 */
export function useDataGrid(config) {
  const { resource, storageKey, defaultSort, defaultFilters, defaultPageSize = 25 } = config;

  const persisted = useMemo(() => loadPersisted(storageKey), [storageKey]);

  const [state, setState] = useState(() => ({
    ...DEFAULT_STATE,
    limit: defaultPageSize,
    sort: defaultSort || [],
    filters: defaultFilters || {},
    ...persisted,
    page: 1,
    selection: [],
  }));

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const debouncedSearch = useDebounce(state.search, 350);

  const queryParams = useMemo(() => ({
    page: state.page,
    limit: state.limit,
    sort: serializeSort(state.sort),
    search: debouncedSearch || undefined,
    filters: Object.keys(state.filters || {}).length ? JSON.stringify(state.filters) : undefined,
  }), [state.page, state.limit, state.sort, state.filters, debouncedSearch]);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await datagridService.list(resource, queryParams, { signal: controller.signal });
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      setError(err?.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [resource, queryParams]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  useEffect(() => {
    persist(storageKey, state);
  }, [state, storageKey]);

  // ---- mutators ---------------------------------------------------------

  const setPage = (page) => setState((s) => ({ ...s, page }));
  const setLimit = (limit) => setState((s) => ({ ...s, limit, page: 1 }));
  const setSearch = (search) => setState((s) => ({ ...s, search, page: 1 }));
  const setSort = (sort) => setState((s) => ({ ...s, sort, page: 1 }));

  const toggleSort = (columnId, multi = false) => setState((s) => {
    const existing = s.sort.find((x) => x.id === columnId);
    let next;
    if (!existing) {
      next = multi ? [...s.sort, { id: columnId, desc: false }] : [{ id: columnId, desc: false }];
    } else if (!existing.desc) {
      next = s.sort.map((x) => (x.id === columnId ? { ...x, desc: true } : x));
    } else {
      next = s.sort.filter((x) => x.id !== columnId);
    }
    return { ...s, sort: next, page: 1 };
  });

  const setFilter = (key, value) => setState((s) => {
    const filters = { ...s.filters };
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete filters[key];
    } else {
      filters[key] = value;
    }
    return { ...s, filters, page: 1 };
  });

  const clearFilters = () => setState((s) => ({ ...s, filters: {}, page: 1 }));

  const setColumnVisibility = (updater) => setState((s) => ({
    ...s,
    columnVisibility: typeof updater === 'function' ? updater(s.columnVisibility) : updater,
  }));

  const setColumnOrder = (columnOrder) => setState((s) => ({ ...s, columnOrder }));
  const setPinnedColumns = (pinnedColumns) => setState((s) => ({ ...s, pinnedColumns }));
  const setDensity = (density) => setState((s) => ({ ...s, density }));

  const setSelection = (updater) => setState((s) => ({
    ...s,
    selection: typeof updater === 'function' ? updater(s.selection) : updater,
  }));

  const toggleRowSelected = (id) => setSelection((sel) => (
    sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
  ));

  const selectAllOnPage = () => setSelection((sel) => {
    const pageIds = data.map((r) => r._id);
    const merged = new Set([...sel, ...pageIds]);
    return Array.from(merged);
  });

  const clearSelection = () => setSelection([]);

  const invertSelectionOnPage = () => setSelection((sel) => {
    const pageIds = new Set(data.map((r) => r._id));
    const kept = sel.filter((id) => !pageIds.has(id));
    const inverted = data.map((r) => r._id).filter((id) => !sel.includes(id));
    return [...kept, ...inverted];
  });

  const resetToDefaults = () => setState({
    ...DEFAULT_STATE,
    limit: defaultPageSize,
    sort: defaultSort || [],
    filters: defaultFilters || {},
  });

  return {
    state,
    data,
    meta,
    loading,
    error,
    refetch: fetchData,
    setPage,
    setLimit,
    setSearch,
    setSort,
    toggleSort,
    setFilter,
    clearFilters,
    setColumnVisibility,
    setColumnOrder,
    setPinnedColumns,
    setDensity,
    setSelection,
    toggleRowSelected,
    selectAllOnPage,
    clearSelection,
    invertSelectionOnPage,
    resetToDefaults,
    queryParams,
  };
}

export default useDataGrid;
