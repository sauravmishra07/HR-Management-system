import { createSlice } from '@reduxjs/toolkit';

const persisted = (() => {
  try {
    return JSON.parse(localStorage.getItem('ramp_auth')) || {};
  } catch {
    return {};
  }
})();

const initialState = {
  user: persisted.user || null,
  accessToken: persisted.accessToken || null,
  isAuthenticated: Boolean(persisted.accessToken),
};

function persist(state) {
  localStorage.setItem(
    'ramp_auth',
    JSON.stringify({ user: state.user, accessToken: state.accessToken })
  );
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload }) {
      if (payload.accessToken) state.accessToken = payload.accessToken;
      if (payload.user) state.user = payload.user;
      state.isAuthenticated = Boolean(state.accessToken);
      persist(state);
    },
    updateUser(state, { payload }) {
      state.user = { ...state.user, ...payload };
      persist(state);
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('ramp_auth');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;

export const selectAuth = (s) => s.auth;
export const selectUser = (s) => s.auth.user;
export const selectRole = (s) => s.auth.user?.role;

export default authSlice.reducer;
