import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Always check session on mount — JWT is stored as an httpOnly cookie
  useEffect(() => {
    api.getMe()
      .then(data => setUser(data.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setUser(data.user);
    return data;
  };

  const signup = async (username, email, password) => {
    const data = await api.signup({ username, email, password });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try { await api.logout(); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
