import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { studentsAPI } from '../../api/endpoints';
import { ATTENDANCE_STATUS } from '../../config/constants';
import { getPhotoUrl } from '../../utils/photoUrl';

function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    isMobile: window.innerWidth < 640,
    isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        isMobile: window.innerWidth < 640,
        isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

export default function AttendanceHistory({ student, onClose }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isMobile } = useScreenSize();

  useEffect(() => {
    loadHistory();
  }, [student.id]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAttendanceHistory(student.id);
      setHistory(response.data);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '1rem' : '2rem',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '1rem' : '1.5rem',
      maxWidth: isMobile ? '100%' : '900px',
      width: '100%',
      maxHeight: isMobile ? '90vh' : '85vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      overflow: 'hidden',
    },
    header: {
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      padding: isMobile ? '1.25rem' : '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.875rem' : '1rem',
      color: 'white',
    },
    photo: {
      width: isMobile ? '64px' : '80px',
      height: isMobile ? '64px' : '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    },
    photoPlaceholder: {
      width: isMobile ? '64px' : '80px',
      height: isMobile ? '64px' : '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '1.75rem' : '2.25rem',
      fontWeight: 'bold',
      color: 'white',
      border: '3px solid white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    },
    studentInfo: {
      flex: 1,
      minWidth: 0,
    },
    studentName: {
      fontSize: isMobile ? '1.125rem' : '1.375rem',
      fontWeight: '700',
      marginBottom: '0.25rem',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    studentDetails: {
      fontSize: isMobile ? '0.875rem' : '1rem',
      opacity: 0.9,
    },
    closeButton: {
      width: isMobile ? '36px' : '40px',
      height: isMobile ? '36px' : '40px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      fontSize: isMobile ? '1.125rem' : '1.25rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    content: {
      padding: isMobile ? '1rem' : '1.5rem',
      overflowY: 'auto',
      flex: 1,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
      gap: isMobile ? '0.75rem' : '1rem',
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },
    statCard: {
      padding: isMobile ? '1rem' : '1.25rem',
      borderRadius: '0.75rem',
      textAlign: 'center',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
    },
    statValue: {
      fontSize: isMobile ? '1.75rem' : '2.25rem',
      fontWeight: '700',
      marginBottom: '0.25rem',
      lineHeight: 1,
    },
    statLabel: {
      fontSize: isMobile ? '0.65rem' : '0.75rem',
      color: '#64748b',
      textTransform: 'uppercase',
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
    tableContainer: {
      overflowX: 'auto',
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
    },
    th: {
      padding: isMobile ? '0.75rem' : '1rem',
      textAlign: 'left',
      fontWeight: '600',
      color: '#1e293b',
      backgroundColor: '#f8fafc',
      borderBottom: '2px solid #e2e8f0',
      fontSize: isMobile ? '0.75rem' : '0.875rem',
    },
    td: {
      padding: isMobile ? '0.75rem' : '1rem',
      borderBottom: '1px solid #e2e8f0',
    },
    statusBadge: {
      padding: '0.375rem 0.75rem',
      borderRadius: '9999px',
      fontSize: isMobile ? '0.7rem' : '0.8rem',
      fontWeight: '600',
      display: 'inline-block',
    },
    loading: {
      textAlign: 'center',
      padding: isMobile ? '2rem' : '3rem',
      color: '#64748b',
    },
    empty: {
      textAlign: 'center',
      padding: isMobile ? '2rem' : '3rem',
      color: '#94a3b8',
    },
  };

  const getStatusStyle = (status) => {
    const color = ATTENDANCE_STATUS[status]?.color || '#6b7280';
    return {
      ...styles.statusBadge,
      backgroundColor: `${color}15`,
      color: color,
      border: `1px solid ${color}40`,
    };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.overlay}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          style={styles.modal}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.header}>
            {student.photo ? (
              <img
                src={getPhotoUrl(student.photo)}
                alt={student.full_name}
                style={styles.photo}
              />
            ) : (
              <div style={styles.photoPlaceholder}>
                {student.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={styles.studentInfo}>
              <div style={styles.studentName}>{student.full_name}</div>
              <div style={styles.studentDetails}>
                DNI: {student.dni} • {student.grade}° - Sección {student.section}
              </div>
            </div>
            <button
              style={styles.closeButton}
              onClick={onClose}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              ✕
            </button>
          </div>

          <div style={styles.content}>
            {loading ? (
              <div style={styles.loading}>Cargando historial...</div>
            ) : !history ? (
              <div style={styles.empty}>Error al cargar el historial</div>
            ) : history.stats.total_days === 0 ? (
              <div style={styles.empty}>Sin registros de asistencia</div>
            ) : (
              <>
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: '#64748b' }}>
                      {history.stats.total_days}
                    </div>
                    <div style={styles.statLabel}>Total Días</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: ATTENDANCE_STATUS.present.color }}>
                      {history.stats.present}
                    </div>
                    <div style={styles.statLabel}>Presentes</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: ATTENDANCE_STATUS.late.color }}>
                      {history.stats.late}
                    </div>
                    <div style={styles.statLabel}>Tardanzas</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: ATTENDANCE_STATUS.absent.color }}>
                      {history.stats.absent}
                    </div>
                    <div style={styles.statLabel}>Faltas</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: '#1e40af' }}>
                      {history.stats.attendance_percentage}%
                    </div>
                    <div style={styles.statLabel}>Asistencia</div>
                  </div>
                </div>

                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Fecha</th>
                        <th style={styles.th}>Estado</th>
                        <th style={styles.th}>Hora</th>
                        {!isMobile && <th style={styles.th}>Método</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {history.history.map((record, index) => (
                        <tr key={index}>
                          <td style={styles.td}>
                            {new Date(record.date).toLocaleDateString('es-PE', {
                              weekday: isMobile ? 'short' : 'short',
                              day: 'numeric',
                              month: isMobile ? 'short' : 'short',
                              year: isMobile ? undefined : 'numeric',
                            })}
                          </td>
                          <td style={styles.td}>
                            <span style={getStatusStyle(record.status)}>
                              {record.status_display}
                            </span>
                          </td>
                          <td style={styles.td}>{record.time}</td>
                          {!isMobile && <td style={styles.td}>{record.method}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
