import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: BASE, withCredentials: false });

// Attach access token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('dsl_access_token');
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
  return cfg;
});

// Auto-refresh on 401
let refreshing = null;
api.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      if (!refreshing) {
        const rt = localStorage.getItem('dsl_refresh_token');
        if (!rt) { clearAuth(); return Promise.reject(err); }
        refreshing = axios.post(`${BASE}/api/auth/refresh`, { refreshToken: rt })
          .then(res => {
            localStorage.setItem('dsl_access_token',  res.data.accessToken);
            localStorage.setItem('dsl_refresh_token', res.data.refreshToken);
            refreshing = null;
          })
          .catch(() => { clearAuth(); refreshing = null; });
      }
      await refreshing;
      return api(orig);
    }
    return Promise.reject(err);
  }
);

function clearAuth() {
  localStorage.removeItem('dsl_access_token');
  localStorage.removeItem('dsl_refresh_token');
  localStorage.removeItem('dsl_user');
  window.location.href = '/login';
}

export default api;
