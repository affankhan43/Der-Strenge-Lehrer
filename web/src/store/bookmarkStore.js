import { create } from 'zustand';

const KEY = 'dsl-bookmarks';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export const useBookmarkStore = create((set, get) => ({
  bookmarks: load(),

  addBookmark: (word) => {
    const id = `${word.de}_${word.day || 0}`;
    if (get().bookmarks.find(b => b.id === id)) return;
    const next = [{ ...word, id, savedAt: Date.now() }, ...get().bookmarks];
    save(next);
    set({ bookmarks: next });
  },

  removeBookmark: (id) => {
    const next = get().bookmarks.filter(b => b.id !== id);
    save(next);
    set({ bookmarks: next });
  },

  isBookmarked: (de, day) => {
    const id = `${de}_${day || 0}`;
    return !!get().bookmarks.find(b => b.id === id);
  },
}));
