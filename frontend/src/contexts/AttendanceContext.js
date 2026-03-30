import React, { createContext, useState, useContext, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { sessionsAPI, statsAPI } from '../api/endpoints';
import { toast } from 'react-toastify';

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const [currentSession, setCurrentSession] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
  });
  const [sessionLoading, setSessionLoading] = useState(false);

  // Handler para mensajes WebSocket
  const handleWsMessage = useCallback((data) => {
    switch (data.type) {
      case 'attendance_registered':
        // Agregar al historial de escaneos (limitado a 20)
        setRecentScans((prev) => [data.data, ...prev].slice(0, 20));
        // Actualizar estadisticas
        if (data.counters) {
          setStats(data.counters);
        }
        // Notificacion (usa toastId fijo para reemplazar en vez de acumular)
        const toastConfig = { toastId: 'scan-toast' };
        if (data.already_registered) {
          toast.info(`${data.data.student_name} - YA REGISTRADO`, toastConfig);
        } else if (data.data.status === 'present') {
          toast.success(`${data.data.student_name} - PRESENTE`, toastConfig);
        } else if (data.data.status === 'late') {
          toast.warning(`${data.data.student_name} - TARDANZA`, toastConfig);
        }
        break;

      case 'attendance_error':
        toast.error(data.message || 'Error en el escaneo');
        break;

      case 'session_opened':
        setCurrentSession(data.session);
        toast.info('Sesion de asistencia abierta');
        break;

      case 'session_closed':
        setCurrentSession(null);
        if (data.final_stats) {
          setStats(data.final_stats);
        }
        toast.info('Sesion de asistencia cerrada');
        break;

      default:
        // Mensaje WS no manejado - ignorar
        break;
    }
  }, []);

  const { isConnected, connectionStatus, sendMessage } = useWebSocket(handleWsMessage);

  // Cargar sesion actual
  const loadCurrentSession = useCallback(async () => {
    setSessionLoading(true);
    try {
      const response = await sessionsAPI.getCurrent();
      setCurrentSession(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error cargando sesion:', error);
      }
      setCurrentSession(null);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // Cargar estadisticas
  const loadStats = useCallback(async () => {
    try {
      const response = await statsAPI.today();
      setStats(response.data);
    } catch (error) {
      console.error('Error cargando estadisticas:', error);
    }
  }, []);

  // Escanear asistencia via WebSocket
  const scanAttendance = useCallback((dni, laptopId = 'WEB', method = 'scanner') => {
    sendMessage({
      type: 'scan_attendance',
      dni,
      laptop_id: laptopId,
      method: method,
    });
  }, [sendMessage]);

  const value = {
    currentSession,
    recentScans,
    stats,
    sessionLoading,
    isConnected,
    connectionStatus,
    loadCurrentSession,
    loadStats,
    scanAttendance,
    setRecentScans,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance debe usarse dentro de un AttendanceProvider');
  }
  return context;
}
