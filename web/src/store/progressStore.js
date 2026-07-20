import { create } from 'zustand';
import api from '../lib/api';

export const useProgressStore = create((set, get) => ({
  progress: null,
  tasks: [],
  stats: null,
  history: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [pRes, tRes, sRes] = await Promise.all([
        api.get('/api/progress'),
        api.get('/api/tasks'),
        api.get('/api/stats'),
      ]);
      set({ progress: pRes.data, tasks: tRes.data, stats: sRes.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load', loading: false });
    }
  },

  fetchHistory: async () => {
    try {
      const res = await api.get('/api/history');
      set({ history: res.data });
    } catch {}
  },

  recordLinkClick: async (taskId, day) => {
    try { await api.post('/api/progress/link-click', { taskId, day }); } catch {}
  },

  completeTask: async (taskId, day) => {
    try {
      const res = await api.post('/api/progress/complete-task', { taskId, day });
      set({ progress: res.data.progress });
      // Refresh stats silently
      api.get('/api/stats').then(r => set({ stats: r.data })).catch(() => {});
      return { ok: true, xpGained: res.data.xpGained, levelUp: res.data.levelUp, currentLevel: res.data.currentLevel };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || 'Failed' };
    }
  },

  reset: async () => {
    try {
      await api.post('/api/progress/reset');
      set({ progress: null, stats: null, history: [] });
      return { ok: true };
    } catch { return { ok: false }; }
  },
}));
