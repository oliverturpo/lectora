import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { attendanceAPI, sessionsAPI } from '../api/endpoints';
import { getPhotoUrl } from '../utils/photoUrl';
import { toast } from 'react-toastify';
import Loading from '../components/common/Loading';
import { useIsMobile } from '../hooks/useScreenSize';

export default function CorreccionesPage() {
  const { isDirector } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const pageTitle = isDirector ? 'Gestionar Asistencias' : 'Corregir Tardanzas';
  const pageSubtitle = isDirector
    ? 'Modificar estado de asistencia de cualquier día'
    : 'Cambiar estado de TARDANZA a PRESENTE (solo hoy)';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let session;

      if (isDirector) {
        // Director: buscar sesión por fecha seleccionada
        const sessionsRes = await sessionsAPI.list({ date: selectedDate });
        const sessions = sessionsRes.data.results || sessionsRes.data || [];
        session = sessions.find(s => s.date === selectedDate);
      } else {
        // Auxiliar: solo sesión actual
        const sessionRes = await sessionsAPI.getCurrent();
        session = sessionRes.data;
      }

      if (!session) {
        setCurrentSession(null);
        setAttendances([]);
        setLoading(false);
        return;
      }

      setCurrentSession(session);

      // Obtener asistencias
      const params = { session: session.id };

      // Auxiliar: solo tardanzas
      if (!isDirector) {
        params.status = 'late';
      } else if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const attendanceRes = await attendanceAPI.list(params);
      setAttendances(attendanceRes.data.results || attendanceRes.data || []);
    } catch (error) {
      if (error.response?.status === 404) {
        setCurrentSession(null);
        setAttendances([]);
      } else {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar datos');
      }
    } finally {
      setLoading(false);
    }
  }, [isDirector, selectedDate, filterStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChangeStatus = async (attendanceId, studentName, newStatus) => {
    setUpdating(attendanceId);
    try {
      await attendanceAPI.updateStatus(attendanceId, { status: newStatus });
      const statusLabels = { present: 'PRESENTE', late: 'TARDANZA', absent: 'FALTA' };
      toast.success(`${studentName} actualizado a ${statusLabels[newStatus]}`);
      loadData();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error(error.response?.data?.error || 'Error al actualizar');
    } finally {
      setUpdating(null);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const getStatusConfig = (status) => {
    const config = {
      present: { bg: '#dcfce7', color: '#166534', label: 'PRESENTE' },
      late: { bg: '#fef3c7', color: '#92400e', label: 'TARDANZA' },
      absent: { bg: '#fee2e2', color: '#991b1b', label: 'FALTA' },
    };
    return config[status] || config.absent;
  };

  // Filtrar asistencias por búsqueda
  const filteredAttendances = attendances.filter((att) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      att.student_name?.toLowerCase().includes(term) ||
      att.student_dni?.includes(term)
    );
  });

  const styles = {
    header: {
      marginBottom: isMobile ? '1rem' : '1.5rem',
    },
    title: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    subtitle: {
      color: '#6b7280',
      marginTop: '0.25rem',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
    },
    filters: {
      display: 'flex',
      gap: '0.75rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    filterLabel: {
      fontSize: '0.75rem',
      fontWeight: 500,
      color: '#6b7280',
    },
    input: {
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      minWidth: '150px',
    },
    searchInput: {
      padding: '0.625rem 1rem',
      paddingLeft: '2.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      width: '100%',
      maxWidth: '300px',
    },
    searchContainer: {
      position: 'relative',
      flex: isMobile ? '1 1 100%' : '0 0 auto',
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
    },
    select: {
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      minWidth: '130px',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    },
    cardHeader: {
      padding: isMobile ? '1rem' : '1.25rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.5rem',
    },
    cardTitle: {
      fontSize: isMobile ? '0.95rem' : '1rem',
      fontWeight: 600,
      color: '#374151',
    },
    sessionInfo: {
      fontSize: '0.8rem',
      color: '#6b7280',
    },
    emptyState: {
      padding: '3rem 1rem',
      textAlign: 'center',
      color: '#9ca3af',
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      opacity: 0.5,
    },
    list: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.75rem' : '1rem',
      padding: isMobile ? '0.875rem 1rem' : '1rem 1.25rem',
      borderBottom: '1px solid #f3f4f6',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
    },
    photo: {
      width: isMobile ? '40px' : '48px',
      height: isMobile ? '40px' : '48px',
      borderRadius: '0.5rem',
      objectFit: 'cover',
      backgroundColor: '#f3f4f6',
    },
    photoPlaceholder: {
      width: isMobile ? '40px' : '48px',
      height: isMobile ? '40px' : '48px',
      borderRadius: '0.5rem',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: '1.25rem',
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      fontWeight: 600,
      fontSize: isMobile ? '0.875rem' : '0.95rem',
      color: '#1f2937',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    details: {
      fontSize: isMobile ? '0.75rem' : '0.8rem',
      color: '#6b7280',
      marginTop: '0.125rem',
    },
    statusContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      minWidth: isMobile ? 'auto' : '100px',
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    badge: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      fontSize: '0.8rem',
      fontWeight: 700,
      minWidth: '90px',
      textAlign: 'center',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
    btn: {
      padding: '0.4rem 0.6rem',
      borderRadius: '0.375rem',
      border: '1px solid transparent',
      fontSize: '0.75rem',
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '28px',
      transition: 'all 150ms',
    },
    btnPresent: {
      backgroundColor: '#dcfce7',
      color: '#166534',
    },
    btnLate: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
    btnAbsent: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    },
    btnDisabled: {
      backgroundColor: '#e5e7eb',
      color: '#9ca3af',
      cursor: 'not-allowed',
    },
    refreshBtn: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      backgroundColor: 'white',
      fontSize: '0.8rem',
      fontWeight: 500,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      color: '#374151',
    },
    noSession: {
      padding: '3rem 1rem',
      textAlign: 'center',
      backgroundColor: '#fef3c7',
      borderRadius: '0.75rem',
      color: '#92400e',
    },
  };

  if (loading) {
    return <Loading text="Cargando..." />;
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>{pageTitle}</h1>
        <p style={styles.subtitle}>{pageSubtitle}</p>
      </div>

      {/* Filtros */}
      <div style={styles.filters}>
        {/* Búsqueda - visible para todos */}
        <div style={styles.searchContainer}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={styles.searchIcon}
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por DNI o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Filtros adicionales - Solo para director */}
        {isDirector && (
          <>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Fecha</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.select}
              >
                <option value="all">Todos</option>
                <option value="present">Presentes</option>
                <option value="late">Tardanzas</option>
                <option value="absent">Faltas</option>
              </select>
            </div>
          </>
        )}
      </div>

      {!currentSession ? (
        <div style={styles.noSession}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            {isDirector ? 'No hay sesión para esta fecha' : 'No hay sesión activa hoy'}
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            {isDirector ? 'Seleccione otra fecha con registros de asistencia' : 'Las correcciones solo están disponibles cuando hay una sesión abierta'}
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                Registros de Asistencia ({filteredAttendances.length}{searchTerm ? ` de ${attendances.length}` : ''})
              </div>
              {isDirector && (
                <div style={styles.sessionInfo}>
                  {formatDate(currentSession.date)} •
                  Estado: {currentSession.status === 'open' ? 'Abierta' : 'Cerrada'}
                </div>
              )}
            </div>
            <button onClick={loadData} style={styles.refreshBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Actualizar
            </button>
          </div>

          {filteredAttendances.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📋</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                {searchTerm ? 'Sin resultados' : 'No hay registros'}
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                {searchTerm
                  ? `No se encontró "${searchTerm}"`
                  : isDirector
                    ? 'No hay asistencias con el filtro seleccionado'
                    : 'No hay tardanzas para corregir hoy'}
              </div>
            </div>
          ) : (
            <ul style={styles.list}>
              {filteredAttendances.map((attendance) => {
                const statusConfig = getStatusConfig(attendance.status);
                const isUpdating = updating === attendance.id;

                return (
                  <li key={attendance.id} style={styles.listItem}>
                    {attendance.student_photo ? (
                      <img
                        src={getPhotoUrl(attendance.student_photo)}
                        alt=""
                        style={styles.photo}
                      />
                    ) : (
                      <div style={styles.photoPlaceholder}>👤</div>
                    )}

                    <div style={styles.info}>
                      <div style={styles.name}>{attendance.student_name}</div>
                      <div style={styles.details}>
                        {attendance.student_grade}° {attendance.student_section} • DNI: {attendance.student_dni}
                        {attendance.scan_timestamp && ` • ${formatTime(attendance.scan_timestamp)}`}
                      </div>
                    </div>

                    {/* Estado actual - prominente */}
                    <div style={styles.statusContainer}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.color,
                        border: `2px solid ${statusConfig.color}`,
                      }}>
                        {statusConfig.label}
                      </span>

                      {/* Botones de cambio */}
                      <div style={styles.actions}>
                        {isDirector ? (
                          // Director: puede cambiar a cualquier estado
                          <>
                            {attendance.status !== 'present' && (
                              <button
                                onClick={() => handleChangeStatus(attendance.id, attendance.student_name, 'present')}
                                disabled={isUpdating}
                                style={{
                                  ...styles.btn,
                                  ...(isUpdating ? styles.btnDisabled : styles.btnPresent),
                                }}
                                title="Cambiar a Presente"
                              >
                                P
                              </button>
                            )}
                            {attendance.status !== 'late' && (
                              <button
                                onClick={() => handleChangeStatus(attendance.id, attendance.student_name, 'late')}
                                disabled={isUpdating}
                                style={{
                                  ...styles.btn,
                                  ...(isUpdating ? styles.btnDisabled : styles.btnLate),
                                }}
                                title="Cambiar a Tardanza"
                              >
                                T
                              </button>
                            )}
                            {attendance.status !== 'absent' && (
                              <button
                                onClick={() => handleChangeStatus(attendance.id, attendance.student_name, 'absent')}
                                disabled={isUpdating}
                                style={{
                                  ...styles.btn,
                                  ...(isUpdating ? styles.btnDisabled : styles.btnAbsent),
                                }}
                                title="Cambiar a Falta"
                              >
                                F
                              </button>
                            )}
                          </>
                        ) : (
                          // Auxiliar: solo cambiar tardanza a presente
                          <button
                            onClick={() => handleChangeStatus(attendance.id, attendance.student_name, 'present')}
                            disabled={isUpdating}
                            style={{
                              ...styles.btn,
                              ...(isUpdating ? styles.btnDisabled : styles.btnPresent),
                            }}
                          >
                            {isUpdating ? '...' : 'Presente'}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
