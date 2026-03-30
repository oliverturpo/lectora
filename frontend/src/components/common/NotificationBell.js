import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../hooks/useAuth';

// Icono de campana simple
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function NotificationBell() {
  const { canViewNotifications } = useAuth();
  const { notifications, unreadCount, loadNotifications, markAsRead, markAllAsRead, loading, loaded } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // No mostrar si el usuario no puede ver notificaciones
  if (!canViewNotifications) return null;

  const handleBellClick = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    // Cargar notificaciones solo al abrir (y si no se han cargado)
    if (newState && !loaded) {
      loadNotifications();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('es-PE');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'manual_entry_alert': return '⚠️';
      case 'justification_limit': return '📋';
      default: return '🔔';
    }
  };

  const styles = {
    container: { position: 'relative' },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      backgroundColor: isOpen ? '#f0f0f0' : 'transparent',
      border: '1px solid #e5e5e5',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      color: '#666',
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      minWidth: '18px',
      height: '18px',
      padding: '0 5px',
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '9px',
      fontSize: '0.7rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '0.5rem',
      width: '300px',
      maxWidth: 'calc(100vw - 2rem)',
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      border: '1px solid #e5e5e5',
      zIndex: 1100,
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #e5e5e5',
    },
    headerTitle: { fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a' },
    markAllBtn: {
      fontSize: '0.75rem',
      color: '#3b82f6',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    list: { maxHeight: '300px', overflowY: 'auto' },
    item: {
      display: 'flex',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #f3f4f6',
      cursor: 'pointer',
    },
    itemUnread: { backgroundColor: '#f0f7ff' },
    itemIcon: { fontSize: '1rem', flexShrink: 0 },
    itemContent: { flex: 1, minWidth: 0 },
    itemTitle: { fontWeight: 500, fontSize: '0.8rem', color: '#1a1a1a', marginBottom: '0.125rem' },
    itemMessage: {
      fontSize: '0.75rem',
      color: '#6b7280',
      lineHeight: 1.3,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    itemTime: { fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.25rem' },
    empty: { padding: '2rem 1rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' },
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      <button onClick={handleBellClick} style={styles.button} aria-label="Notificaciones">
        <BellIcon />
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>Notificaciones</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={styles.markAllBtn}>
                Marcar leídas
              </button>
            )}
          </div>

          <div style={styles.list}>
            {loading ? (
              <div style={styles.empty}>Cargando...</div>
            ) : notifications.length === 0 ? (
              <div style={styles.empty}>Sin notificaciones</div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  style={{ ...styles.item, ...(!n.is_read ? styles.itemUnread : {}) }}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                >
                  <span style={styles.itemIcon}>{getIcon(n.notification_type)}</span>
                  <div style={styles.itemContent}>
                    <div style={styles.itemTitle}>{n.title}</div>
                    <div style={styles.itemMessage}>{n.message}</div>
                    <div style={styles.itemTime}>{formatTime(n.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
