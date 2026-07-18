import apiClient from './apiClient.js';

/**
 * Thin wrapper around the generic /datagrid/:resource endpoints.
 * Every DataGrid instance (any collection) uses these same functions —
 * only `resource` and the query params change.
 */
export const datagridService = {
  getMeta(resource, { signal } = {}) {
    return apiClient.get(`/datagrid/${resource}/meta`, { signal }).then((r) => r.data);
  },

  list(resource, params, { signal } = {}) {
    return apiClient
      .get(`/datagrid/${resource}`, {
        signal,
        params,
        paramsSerializer: { indexes: null },
      })
      .then((r) => r.data);
  },

  getOne(resource, id) {
    return apiClient.get(`/datagrid/${resource}/${id}`).then((r) => r.data);
  },

  create(resource, payload) {
    return apiClient.post(`/datagrid/${resource}`, payload).then((r) => r.data);
  },

  update(resource, id, payload) {
    return apiClient.patch(`/datagrid/${resource}/${id}`, payload).then((r) => r.data);
  },

  remove(resource, id) {
    return apiClient.delete(`/datagrid/${resource}/${id}`).then((r) => r.data);
  },

  bulkDelete(resource, ids) {
    return apiClient.post(`/datagrid/${resource}/bulk/delete`, { ids }).then((r) => r.data);
  },

  bulkUpdate(resource, ids, patch) {
    return apiClient.post(`/datagrid/${resource}/bulk/update`, { ids, patch }).then((r) => r.data);
  },

  exportUrl(resource, params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      search.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    });
    const base = apiClient.defaults.baseURL || '';
    return `${base}/datagrid/${resource}/export?${search.toString()}`;
  },
};

export default datagridService;
