import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { authApi } from '../services/api.js';

const AuthContext = createContext(null);

// Keeps the logged-in user in memory. The session itself lives in an
// HTTP-only cookie set by the server — nothing sensitive is stored in localStorage.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  // If any protected request comes back 401 (e.g. expired session), log out locally.
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (error) => {
        const url = error.config?.url || '';
        if (error.response?.status === 401 && !url.startsWith('/auth/')) setUser(null);
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (details) => {
    const data = await authApi.register(details);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, checking, login, register, logout, setUser }),
    [user, checking, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
