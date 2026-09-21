import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then(({ user: fetchedUser }) => setUser(fetchedUser))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const register = useCallback(async ({ email, password, role, fullName }) => {
    const { token, user: newUser } = await api.post('/auth/register', {
      email,
      password,
      role,
      fullName,
    });
    setToken(token);
    setUser(newUser);
    return newUser;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { token, user: loggedInUser } = await api.post('/auth/login', { email, password });
    setToken(token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
