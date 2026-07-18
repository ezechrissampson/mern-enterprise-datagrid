import axios from 'axios';

/**
 * Shared Axios instance for the DataGrid module.
 * The host app should already have its own auth token handling (interceptors,
 * cookies, etc.) — this client just needs the base URL configured and will
 * pick up any existing withCredentials/interceptor setup you attach to it.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  timeout: 20000,
});

/**
 * Integration point: if your host app manages auth tokens in memory/localStorage,
 * attach an interceptor here (or externally on this same instance) e.g.:
 *
 * apiClient.interceptors.request.use((config) => {
 *   const token = getAuthToken();
 *   if (token) config.headers.Authorization = `Bearer ${token}`;
 *   return config;
 * });
 */

export default apiClient;
