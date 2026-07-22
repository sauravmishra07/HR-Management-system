import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { setCredentials, logout as logoutAction, updateUser } from '@/store/authSlice';
import { authApi } from '@/api';
import { disconnectSocket } from '@/lib/socket';
import { can as canPerm, canView as canViewFn } from '@/constants/nav';

/** Central auth accessor: user, role, permission helpers, login/logout. */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, accessToken, isAuthenticated } = useSelector((s) => s.auth);
  const role = user?.role;

  const login = useCallback(
    async (credentials) => {
      const res = await authApi.login(credentials);
      dispatch(setCredentials({ accessToken: res.data.accessToken, user: res.data.user }));
      return res.data.user;
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore network errors on logout */
    }
    disconnectSocket();
    dispatch(logoutAction());
  }, [dispatch]);

  const refreshMe = useCallback(async () => {
    const res = await authApi.me();
    dispatch(updateUser(res.data));
    return res.data;
  }, [dispatch]);

  return {
    user,
    role,
    accessToken,
    isAuthenticated,
    empId: user?.empId,
    login,
    logout,
    refreshMe,
    can: (perm) => canPerm(role, perm),
    canView: (view) => canViewFn(role, view),
    isEmployee: role === 'Employee',
  };
}

export default useAuth;
