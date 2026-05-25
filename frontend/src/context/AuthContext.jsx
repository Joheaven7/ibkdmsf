import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── On mount: verify existing token ────────────────────────────────────────
  useEffect(() => {
    const hasToken = api.useCookieAuth || localStorage.getItem('ibkdms_access_token');
    if (!hasToken) { setLoading(false); return; }

    api.get('/auth/me')
      .then(res => setUser(res.user))
      .catch(() => {
        api.clearTokens();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (name, username, email, password) => {
    try {
      const res = await api.post('/auth/register', { 
        name, 
        username, 
        email, 
        password,
        role: 'resident'
      });
      
      if (res.accessToken) api.setToken(res.accessToken);
      if (res.refreshToken) api.setRefreshToken(res.refreshToken);
      localStorage.setItem('ibkdms_user', JSON.stringify(res.user));
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (err) {
      const message = err.errors?.[0]?.message || err.message || 'Registration failed.';
      return { success: false, message };
    }
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      
      if (res.accessToken) api.setToken(res.accessToken);
      if (res.refreshToken) api.setRefreshToken(res.refreshToken);
      localStorage.setItem('ibkdms_user', JSON.stringify(res.user));
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (err) {
      const message = err.message || 'Login failed.';
      return { success: false, message };
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('ibkdms_refresh_token');
      await api.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      api.clearTokens();
      localStorage.removeItem('ibkdms_user');
      setUser(null);
    }
  }, []);

  // ── Update own profile ─────────────────────────────────────────────────────
  const updateMe = async (data) => {
    const res = await api.patch('/users/me', data);
    setUser(res.data);
    localStorage.setItem('ibkdms_user', JSON.stringify(res.data));
    return res;
  };

  // ── Change password ────────────────────────────────────────────────────────
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    const result = await api.patch('/auth/change-password', { 
      currentPassword, 
      newPassword,
      confirmPassword 
    });
    return result;
  };

  // ── User management (admin / superadmin) ───────────────────────────────────
  const getUsers          = ()              => api.get('/users');
  const createUser        = (data)          => api.post('/users', data);
  const updateUser        = (id, data)      => api.patch(`/users/${id}`, data);
  const deleteUser        = (id)            => api.delete(`/users/${id}`);
  const toggleUserStatus  = (id)            => api.patch(`/users/${id}/status`);
  const changeUserRole    = (id, role)      => api.patch(`/users/${id}/role`, { role });
  const setUserPermissions= (id, perms)     => api.patch(`/users/${id}/permissions`, { permissions: perms });

  // ── Admin: reset a user's password ────────────────────────────────────────
  const resetUserPassword = (id, newPassword) =>
    api.patch(`/users/${id}/reset-password`, { newPassword });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user, login, register, logout, updateMe, changePassword,
      getUsers, createUser, updateUser, deleteUser,
      toggleUserStatus, changeUserRole, setUserPermissions,
      resetUserPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}