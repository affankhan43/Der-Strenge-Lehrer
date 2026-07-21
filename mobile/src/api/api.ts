import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Switch between dev/prod
const BASE_URL = __DEV__
  ? 'https://base.strenge-lehrer.de'       // iOS simulator
  : 'https://base.strenge-lehrer.de'; // production

const api = axios.create({ baseURL: BASE_URL });

// Attach token
api.interceptors.request.use(async cfg => {
  const token = await AsyncStorage.getItem('dsl_access_token');
  if (token) cfg.headers!['Authorization'] = `Bearer ${token}`;
  return cfg;
});

// Auto-refresh
let refreshPromise: Promise<void> | null = null;
api.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      if (!refreshPromise) {
        const rt = await AsyncStorage.getItem('dsl_refresh_token');
        if (!rt) { await clearAuth(); return Promise.reject(err); }
        refreshPromise = axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken: rt })
          .then(async res => {
            await AsyncStorage.setItem('dsl_access_token',  res.data.accessToken);
            await AsyncStorage.setItem('dsl_refresh_token', res.data.refreshToken);
          })
          .catch(async () => { await clearAuth(); })
          .finally(() => { refreshPromise = null; });
      }
      await refreshPromise;
      return api(orig);
    }
    return Promise.reject(err);
  }
);

async function clearAuth() {
  await AsyncStorage.multiRemove(['dsl_access_token','dsl_refresh_token','dsl_user']);
}

export default api;

// ── Named endpoints ──
export const authAPI = {
  signup:  (data: any)           => api.post('/api/auth/signup', data),
  login:   (email: string, pw: string) => api.post('/api/auth/login', {email, password: pw}),
  refresh: (rt: string)          => api.post('/api/auth/refresh', {refreshToken: rt}),
  logout:  (rt: string)          => api.post('/api/auth/logout',  {refreshToken: rt}),
  me:      ()                    => api.get('/api/auth/me'),
  profile: (data: any)           => api.patch('/api/auth/profile', data),
};

export const progressAPI = {
  get:           ()              => api.get('/api/progress'),
  tasks:         ()              => api.get('/api/tasks'),
  stats:         ()              => api.get('/api/stats'),
  history:       ()              => api.get('/api/history'),
  linkClick:     (taskId: string, day: number) => api.post('/api/link-click',    {taskId, day}),
  completeTask:  (taskId: string, day: number) => api.post('/api/complete-task', {taskId, day}),
  reset:         ()              => api.post('/api/reset'),
};
