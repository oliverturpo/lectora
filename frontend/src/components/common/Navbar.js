import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { INSTITUTION_NAME } from '../../config/constants';

// Hook para detectar tamano de pantalla
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

// Iconos
const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  scanner: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  ),
  students: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  config: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  close: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

const getIcon = (path) => {
  switch (path) {
    case '/': return Icons.dashboard;
    case '/scanner': return Icons.scanner;
    case '/students': return Icons.students;
    case '/reports': return Icons.reports;
    case '/config': return Icons.config;
    default: return null;
  }
};

export default function Navbar() {
  const { user, isDirector, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  // Cerrar menu al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevenir scroll cuando menu esta abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = isDirector
    ? [
        { path: '/', label: 'Dashboard' },
        { path: '/scanner', label: 'Escaner' },
        { path: '/students', label: 'Estudiantes' },
        { path: '/reports', label: 'Reportes' },
        { path: '/config', label: 'Config' },
      ]
    : [
        { path: '/', label: 'Inicio' },
        { path: '/scanner', label: 'Escaner' },
      ];

  // ==================== ESTILOS ====================
  const styles = {
    nav: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e5e5',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      padding: '0 1rem',
    },
    // Brand / Logo
    brand: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      textDecoration: 'none',
      color: '#1a1a1a',
    },
    logo: {
      width: '36px',
      height: '36px',
      borderRadius: '0.5rem',
      objectFit: 'contain',
    },
    brandText: {
      fontWeight: 700,
      fontSize: '1rem',
      color: '#1a1a1a',
    },
    // Desktop links
    desktopLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    desktopLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.875rem',
      color: '#666',
      textDecoration: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      transition: 'all 150ms',
    },
    desktopLinkActive: {
      backgroundColor: '#f0f0f0',
      color: '#1a1a1a',
    },
    // User section desktop
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.375rem 0.75rem',
      backgroundColor: '#f5f5f5',
      borderRadius: '2rem',
      fontSize: '0.8rem',
      color: '#666',
    },
    userAvatar: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: '#1e40af',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.7rem',
      fontWeight: 600,
    },
    logoutBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: '0.5rem 0.75rem',
      backgroundColor: 'transparent',
      color: '#666',
      border: '1px solid #e5e5e5',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: 500,
      transition: 'all 150ms',
    },
    // Mobile menu button
    menuButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      backgroundColor: 'transparent',
      border: '1px solid #e5e5e5',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      color: '#333',
    },
    // Mobile menu
    mobileOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 1001,
    },
    mobileMenu: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '280px',
      maxWidth: '85vw',
      backgroundColor: 'white',
      zIndex: 1002,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
    },
    mobileHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      borderBottom: '1px solid #eee',
    },
    mobileCloseBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      backgroundColor: '#f5f5f5',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      color: '#666',
    },
    mobileUserInfo: {
      padding: '1.25rem 1rem',
      backgroundColor: '#f9f9f9',
      borderBottom: '1px solid #eee',
    },
    mobileUserName: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#1a1a1a',
      marginBottom: '0.25rem',
    },
    mobileUserRole: {
      fontSize: '0.8rem',
      color: '#999',
    },
    mobileLinks: {
      flex: 1,
      padding: '0.5rem',
      overflowY: 'auto',
    },
    mobileLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1rem',
      color: '#333',
      textDecoration: 'none',
      borderRadius: '0.75rem',
      fontSize: '0.95rem',
      fontWeight: 500,
      marginBottom: '0.25rem',
    },
    mobileLinkActive: {
      backgroundColor: '#f0f0f0',
      color: '#1e40af',
    },
    mobileLinkIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      backgroundColor: '#f5f5f5',
      borderRadius: '0.625rem',
    },
    mobileLinkIconActive: {
      backgroundColor: '#e0e7ff',
      color: '#1e40af',
    },
    mobileFooter: {
      padding: '1rem',
      borderTop: '1px solid #eee',
    },
    mobileLogoutBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      width: '100%',
      padding: '0.875rem',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: 'none',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: 500,
    },
  };

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.container}>
          {/* Brand */}
          <Link to="/" style={styles.brand}>
            <img
              src="/images/logo.png"
              alt="Logo"
              style={styles.logo}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span style={styles.brandText}>
              {isMobile ? 'IESTA' : INSTITUTION_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <div style={styles.desktopLinks}>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{
                      ...styles.desktopLink,
                      ...(isActive(link.path) ? styles.desktopLinkActive : {}),
                    }}
                  >
                    {getIcon(link.path)}
                    {link.label}
                  </Link>
                ))}
              </div>

              <div style={styles.userSection}>
                <div style={styles.userInfo}>
                  <div style={styles.userAvatar}>
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <span>{user?.full_name || user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  style={styles.logoutBtn}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#fef2f2';
                    e.target.style.borderColor = '#fecaca';
                    e.target.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = '#e5e5e5';
                    e.target.style.color = '#666';
                  }}
                >
                  {Icons.logout}
                  Salir
                </button>
              </div>
            </>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              style={styles.menuButton}
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              {Icons.menu}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={styles.mobileOverlay}
              onClick={() => setMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              style={styles.mobileMenu}
            >
              {/* Header */}
              <div style={styles.mobileHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src="/images/logo.jpg"
                    alt="Logo"
                    style={{ width: '28px', height: '28px', borderRadius: '0.375rem' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Menu</span>
                </div>
                <button
                  style={styles.mobileCloseBtn}
                  onClick={() => setMenuOpen(false)}
                  aria-label="Cerrar menu"
                >
                  {Icons.close}
                </button>
              </div>

              {/* User Info */}
              <div style={styles.mobileUserInfo}>
                <div style={styles.mobileUserName}>
                  {user?.full_name || user?.username}
                </div>
                <div style={styles.mobileUserRole}>
                  {isDirector ? 'Director' : 'Auxiliar'}
                </div>
              </div>

              {/* Links */}
              <div style={styles.mobileLinks}>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{
                      ...styles.mobileLink,
                      ...(isActive(link.path) ? styles.mobileLinkActive : {}),
                    }}
                  >
                    <span style={{
                      ...styles.mobileLinkIcon,
                      ...(isActive(link.path) ? styles.mobileLinkIconActive : {}),
                    }}>
                      {getIcon(link.path)}
                    </span>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Footer - Logout */}
              <div style={styles.mobileFooter}>
                <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
                  {Icons.logout}
                  Cerrar Sesion
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
