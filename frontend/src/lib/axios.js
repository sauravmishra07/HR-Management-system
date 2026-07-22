import axios from 'axios';
import { store } from '@/store';
import { setCredentials, logout } from '@/store/authSlice';
import { disconnectSocket } from '@/lib/socket';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

/** Shared axios instance. Sends cookies (refresh token) and JSON. */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the access token to every request.
api.interceptors.request.use((cfg) => {
  const token = store.getState().auth.accessToken;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Transparent refresh on 401. Queues concurrent requests during a single refresh.
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    const isAuthRoute = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh');

    if (status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        refreshing = refreshing || axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        const { data } = await refreshing;
        refreshing = null;
        const accessToken = data.data.accessToken;
        store.dispatch(setCredentials({ accessToken, user: data.data.user }));
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        disconnectSocket();
        store.dispatch(logout());
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

/** Normalise an axios error to a readable message. */
export function apiError(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
}

export default api;
