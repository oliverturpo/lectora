import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { authAPI, usersAPI } from '../api/endpoints';

export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar token al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await usersAPI.me();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    const response = await authAPI.login({ username, password });
    const { access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // Obtener datos del usuario
    const userResponse = await usersAPI.me();
    setUser(userResponse.data);
    setIsAuthenticated(true);

    return userResponse.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    isDirector: user?.role === 'director',
    isAuxiliar: user?.role === 'auxiliar',
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
