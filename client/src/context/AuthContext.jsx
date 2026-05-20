import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('focuscam_user');
    const token = localStorage.getItem('focuscam_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('focuscam_user', JSON.stringify(userData));
    localStorage.setItem('focuscam_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('focuscam_user');
    localStorage.removeItem('focuscam_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateMotivation = (motivation) => {
    const updated = { ...user, motivation };
    setUser(updated);
    localStorage.setItem('focuscam_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateMotivation }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
