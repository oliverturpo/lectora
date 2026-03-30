import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { authAPI, usersAPI } from '../api/endpoints';

export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

// Definición de permisos por rol
const ROLE_PERMISSIONS = {
  director: {
    pages: ['dashboard', 'scanner', 'students', 'reports', 'correcciones', 'avanzado', 'config'],
    canJustify: true,
    canViewNotifications: true,
    canManageStudents: true,
    canManageConfig: true,
    canViewDashboard: true,
    canViewReports: true,
    canViewAvanzado: true,
  },
  psicologo: {
    pages: ['dashboard', 'scanner', 'reports', 'correcciones', 'avanzado'],
    canJustify: true,
    canViewNotifications: true,
    canManageStudents: false,
    canManageConfig: false,
    canViewDashboard: true,
    canViewReports: true,
    canViewAvanzado: true,
  },
  auxiliar: {
    pages: ['scanner', 'correcciones'],
    canJustify: true,
    canViewNotifications: true,
    canManageStudents: false,
    canManageConfig: false,
    canViewDashboard: false,
    canViewReports: false,
    canViewAvanzado: false,
  },
  escaner: {
    pages: ['scanner'],
    canJustify: false,
    canViewNotifications: false,
    canManageStudents: false,
    canManageConfig: false,
    canViewDashboard: false,
    canViewReports: false,
    canViewAvanzado: false,
  },
};

// Mapeo de rutas a páginas
const ROUTE_TO_PAGE = {
  '/': 'dashboard',
  '/scanner': 'scanner',
  '/students': 'students',
  '/reports': 'reports',
  '/correcciones': 'correcciones',
  '/avanzado': 'avanzado',
  '/config': 'config',
};

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

  // Obtener permisos del rol actual
  const permissions = useMemo(() => {
    const role = user?.role || 'escaner';
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.escaner;
  }, [user]);

  // Verificar si el usuario puede acceder a una página
  const canAccessPage = useCallback((page) => {
    return permissions.pages.includes(page);
  }, [permissions]);

  // Verificar si el usuario puede acceder a una ruta
  const canAccessRoute = useCallback((route) => {
    const page = ROUTE_TO_PAGE[route];
    return page ? canAccessPage(page) : false;
  }, [canAccessPage]);

  // Obtener la ruta por defecto según el rol
  const getDefaultRoute = useCallback(() => {
    const role = user?.role || 'escaner';
    switch (role) {
      case 'director':
        return '/';
      case 'psicologo':
        return '/';
      case 'auxiliar':
        return '/scanner';
      case 'escaner':
        return '/scanner';
      default:
        return '/scanner';
    }
  }, [user]);

  // Obtener nombre del rol en español
  const getRoleName = useCallback(() => {
    const role = user?.role || 'escaner';
    const roleNames = {
      director: 'Director',
      psicologo: 'Psicólogo',
      auxiliar: 'Auxiliar',
      escaner: 'Escáner',
    };
    return roleNames[role] || role;
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated,
    // Helpers de rol
    role: user?.role,
    isDirector: user?.role === 'director',
    isAuxiliar: user?.role === 'auxiliar',
    isPsicologo: user?.role === 'psicologo',
    isEscaner: user?.role === 'escaner',
    // Permisos
    permissions,
    canJustify: permissions.canJustify,
    canViewNotifications: permissions.canViewNotifications,
    // Funciones
    canAccessPage,
    canAccessRoute,
    getDefaultRoute,
    getRoleName,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
