import { create } from 'zustand';
import api from '../lib/api';

const stored = () => {
  try { return JSON.parse(localStorage.getItem('dsl_user')); } catch { return null; }
};

export const useAuthStore = create((set, get) => ({
  user: stored(),
  loading: false,
  error: null,

  signup: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/api/auth/signup', data);
      localStorage.setItem('dsl_access_token',  res.data.accessToken);
      localStorage.setItem('dsl_refresh_token', res.data.refreshToken);
      localStorage.setItem('dsl_user', JSON.stringify(res.data.user));
      set({ user: res.data.user, loading: false });
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed';
      set({ error: msg, loading: false });
      return { ok: false, error: msg };
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('dsl_access_token',  res.data.accessToken);
      localStorage.setItem('dsl_refresh_token', res.data.refreshToken);
      localStorage.setItem('dsl_user', JSON.stringify(res.data.user));
      set({ user: res.data.user, loading: false });
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      set({ error: msg, loading: false });
      return { ok: false, error: msg };
    }
  },

  logout: async () => {
    try {
      const rt = localStorage.getItem('dsl_refresh_token');
      await api.post('/api/auth/logout', { refreshToken: rt });
    } catch {}
    localStorage.removeItem('dsl_access_token');
    localStorage.removeItem('dsl_refresh_token');
    localStorage.removeItem('dsl_user');
    set({ user: null });
  },

  updateUser: (updates) => {
    const next = { ...get().user, ...updates };
    localStorage.setItem('dsl_user', JSON.stringify(next));
    set({ user: next });
  },

  clearError: () => set({ error: null }),
}));
