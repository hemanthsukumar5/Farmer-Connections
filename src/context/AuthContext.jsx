import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import i18n from '../i18n';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getProfile();
      setUser(data);
      const lang = data.preferred_language || 'en';
      i18n.changeLanguage(lang);
      localStorage.setItem('rythuconnect_lang', lang);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    await loadUser();
    return data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    i18n.changeLanguage('en');
    localStorage.setItem('rythuconnect_lang', 'en');
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
    if (updates.preferred_language) {
      i18n.changeLanguage(updates.preferred_language);
      localStorage.setItem('rythuconnect_lang', updates.preferred_language);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loadUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
