import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('eventforge_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to authenticate stored token:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const newToken = res.data.token;
    const userData = res.data.user;
    localStorage.setItem('eventforge_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const newToken = res.data.token;
    const newUser = res.data.user;
    localStorage.setItem('eventforge_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('eventforge_token');
    setToken(null);
    setUser(null);
  };

  const quickSwitchRole = async (email, password) => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error('Quick switch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    role: user?.role || 'GUEST',
    login,
    register,
    logout,
    quickSwitchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
