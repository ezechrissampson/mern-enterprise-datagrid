import apiClient from './apiClient.js';

export const savedViewService = {
  list(resource) {
    return apiClient.get('/saved-views', { params: { resource } }).then((r) => r.data);
  },
  create(payload) {
    return apiClient.post('/saved-views', payload).then((r) => r.data);
  },
  update(id, payload) {
    return apiClient.patch(`/saved-views/${id}`, payload).then((r) => r.data);
  },
  remove(id) {
    return apiClient.delete(`/saved-views/${id}`).then((r) => r.data);
  },
  setDefault(id) {
    return apiClient.post(`/saved-views/${id}/default`).then((r) => r.data);
  },
};

export default savedViewService;
