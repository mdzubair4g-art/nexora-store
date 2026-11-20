import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nx_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('nx_token') || null);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('nx_user', JSON.stringify(data.user));
    localStorage.setItem('nx_token', data.token);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('nx_user', JSON.stringify(data.user));
    localStorage.setItem('nx_token', data.token);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nx_user');
    localStorage.removeItem('nx_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
