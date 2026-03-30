import React, { createContext, useState, useCallback, useContext } from 'react';
import { notificationsAPI } from '../api/endpoints';
import { useAuth } from './AuthContext';

export const NotificationContext = createContext(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const { isAuthenticated, canViewNotifications } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Cargar notificaciones SOLO cuando se solicita (al hacer clic en la campana)
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !canViewNotifications) return;

    setLoading(true);
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationsAPI.list(),
        notificationsAPI.unreadCount()
      ]);
      setNotifications(notifRes.data.results || notifRes.data || []);
      setUnreadCount(countRes.data.count || 0);
      setLoaded(true);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, canViewNotifications]);

  // Cargar solo el conteo (más ligero, para el badge)
  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !canViewNotifications) return;

    try {
      const res = await notificationsAPI.unreadCount();
      setUnreadCount(res.data.count || 0);
    } catch (error) {
      console.error('Error cargando conteo:', error);
    }
  }, [isAuthenticated, canViewNotifications]);

  // Agregar notificación desde WebSocket (llamado desde AttendanceContext)
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Marcar una notificación como leída
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationsAPI.markRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  }, []);

  // Resetear estado (al cerrar sesión)
  const reset = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setLoaded(false);
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    loaded,
    loadNotifications,
    loadUnreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    reset,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
