import { createSlice } from '@reduxjs/toolkit';

let toastId = 0;

/** Resolve the initial theme: saved preference → system preference → light. */
function getInitialTheme() {
  try {
    const saved = localStorage.getItem('ramp_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: false, toasts: [], theme: getInitialTheme() },
  reducers: {
    toggleSidebar(state, { payload }) {
      state.sidebarOpen = payload ?? !state.sidebarOpen;
    },
    setTheme(state, { payload }) {
      state.theme = payload === 'dark' ? 'dark' : 'light';
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    pushToast: {
      reducer(state, { payload }) {
        state.toasts.push(payload);
      },
      prepare(message, variant = 'success') {
        return { payload: { id: ++toastId, message, variant } };
      },
    },
    dismissToast(state, { payload }) {
      state.toasts = state.toasts.filter((t) => t.id !== payload);
    },
  },
});

export const { toggleSidebar, setTheme, toggleTheme, pushToast, dismissToast } = uiSlice.actions;

export const selectTheme = (s) => s.ui.theme;

export default uiSlice.reducer;
