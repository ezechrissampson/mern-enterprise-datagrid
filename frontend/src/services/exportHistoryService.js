import apiClient from './apiClient.js';

export const exportHistoryService = {
  list(params) {
    return apiClient.get('/exports', { params }).then((r) => r.data);
  },
  downloadUrl(id) {
    const base = apiClient.defaults.baseURL || '';
    return `${base}/exports/${id}/download`;
  },
  remove(id) {
    return apiClient.delete(`/exports/${id}`).then((r) => r.data);
  },
};

export default exportHistoryService;
