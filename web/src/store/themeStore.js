import { create } from 'zustand';

const STORAGE_KEY = 'dsl-theme';

function applyTheme(dark) {
  if (dark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
}

const saved = localStorage.getItem(STORAGE_KEY);
const initialDark = saved === 'dark';
applyTheme(initialDark);

export const useThemeStore = create((set) => ({
  dark: initialDark,
  toggle: () => set((s) => {
    const next = !s.dark;
    applyTheme(next);
    return { dark: next };
  }),
}));
