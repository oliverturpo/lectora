import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { justificationsAPI } from '../../api/endpoints';
import { toast } from 'react-toastify';

export default function JustificationModal({
  isOpen,
  onClose,
  attendance,
  onSuccess,
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [justificationStatus, setJustificationStatus] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // Cargar estado de justificaciones del estudiante
  useEffect(() => {
    if (isOpen && attendance?.student) {
      loadJustificationStatus();
    }
    // Resetear estado al cerrar
    if (!isOpen) {
      setReason('');
      setShowWarning(false);
      setJustificationStatus(null);
    }
  }, [isOpen, attendance]);

  const loadJustificationStatus = async () => {
    try {
      const response = await justificationsAPI.getStudentStatus(attendance.student);
      setJustificationStatus(response.data);
    } catch (error) {
      console.error('Error cargando estado de justificaciones:', error);
    }
  };

  const handleSubmit = async (forceReset = false) => {
    if (!reason.trim()) {
      toast.error('Ingrese el motivo de justificación');
      return;
    }

    setLoading(true);
    try {
      const response = await justificationsAPI.create({
        attendance_id: attendance.id,
        reason: reason.trim(),
        force_reset: forceReset,
      });

      if (response.data.warning && response.data.requires_confirmation) {
        // Mostrar advertencia
        setShowWarning(true);
        setLoading(false);
        return;
      }

      if (response.data.success) {
        toast.success('Justificación registrada correctamente');
        onSuccess && onSuccess(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creando justificación:', error);
      toast.error(error.response?.data?.error || 'Error al justificar');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = () => {
    handleSubmit(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'late':
        return { bg: '#fef3c7', color: '#92400e', label: 'TARDANZA' };
      case 'absent':
        return { bg: '#fee2e2', color: '#991b1b', label: 'FALTA' };
      default:
        return { bg: '#e5e7eb', color: '#374151', label: status?.toUpperCase() };
    }
  };

  if (!isOpen || !attendance) return null;

  const statusConfig = getStatusColor(attendance.status);

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '1rem',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      overflow: 'hidden',
    },
    header: {
      padding: '1.25rem 1.5rem',
      borderBottom: '1px solid #e5e7eb',
    },
    title: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1a1a1a',
      marginBottom: '0.25rem',
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    body: {
      padding: '1.5rem',
    },
    studentInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.75rem',
      marginBottom: '1.25rem',
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '0.5rem',
      backgroundColor: '#e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
    },
    studentDetails: {
      flex: 1,
    },
    studentName: {
      fontWeight: 600,
      color: '#1a1a1a',
      fontSize: '0.95rem',
    },
    studentMeta: {
      fontSize: '0.8rem',
      color: '#6b7280',
      marginTop: '0.125rem',
    },
    statusBadge: {
      padding: '0.375rem 0.75rem',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      fontWeight: 700,
      backgroundColor: statusConfig.bg,
      color: statusConfig.color,
    },
    justificationInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1rem',
      backgroundColor: '#eff6ff',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      border: '1px solid #dbeafe',
    },
    justificationCount: {
      fontSize: '0.875rem',
      color: '#1e40af',
    },
    warningBox: {
      padding: '1rem',
      backgroundColor: '#fef3c7',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      border: '1px solid #fcd34d',
    },
    warningTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: 600,
      color: '#92400e',
      marginBottom: '0.5rem',
    },
    warningText: {
      fontSize: '0.875rem',
      color: '#78350f',
      lineHeight: 1.5,
    },
    formGroup: {
      marginBottom: '1rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151',
      marginBottom: '0.5rem',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      resize: 'vertical',
      minHeight: '100px',
      fontFamily: 'inherit',
    },
    footer: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'flex-end',
      padding: '1rem 1.5rem',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
    },
    btn: {
      padding: '0.625rem 1.25rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 150ms',
    },
    btnCancel: {
      backgroundColor: 'white',
      color: '#374151',
      border: '1px solid #d1d5db',
    },
    btnPrimary: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
    },
    btnWarning: {
      backgroundColor: '#f59e0b',
      color: 'white',
      border: 'none',
    },
    btnDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={styles.overlay}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={styles.header}>
              <h2 style={styles.title}>Justificar Asistencia</h2>
              <p style={styles.subtitle}>
                Registrar motivo de {attendance.status === 'late' ? 'tardanza' : 'falta'}
              </p>
            </div>

            {/* Body */}
            <div style={styles.body}>
              {/* Student Info */}
              <div style={styles.studentInfo}>
                <div style={styles.avatar}>👤</div>
                <div style={styles.studentDetails}>
                  <div style={styles.studentName}>{attendance.student_name}</div>
                  <div style={styles.studentMeta}>
                    {attendance.student_grade}° {attendance.student_section} • DNI: {attendance.student_dni}
                  </div>
                </div>
                <span style={styles.statusBadge}>{statusConfig.label}</span>
              </div>

              {/* Justification Count Info */}
              {justificationStatus && (
                <div style={styles.justificationInfo}>
                  <span style={{ fontSize: '1.25rem' }}>📋</span>
                  <div style={styles.justificationCount}>
                    <strong>{justificationStatus.count}</strong> de 3 justificaciones usadas
                    {justificationStatus.remaining > 0 && (
                      <span> ({justificationStatus.remaining} restantes)</span>
                    )}
                  </div>
                </div>
              )}

              {/* Warning Box */}
              {showWarning && (
                <div style={styles.warningBox}>
                  <div style={styles.warningTitle}>
                    <span>⚠️</span>
                    Límite de justificaciones alcanzado
                  </div>
                  <p style={styles.warningText}>
                    {attendance.student_name} ya tiene {justificationStatus?.count || 3} justificaciones.
                    Si continúa, el contador se reiniciará a 0 y esta será la primera justificación del nuevo ciclo.
                  </p>
                </div>
              )}

              {/* Reason Input */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Motivo de justificación *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ingrese el motivo de la justificación..."
                  style={styles.textarea}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <button
                onClick={onClose}
                style={{ ...styles.btn, ...styles.btnCancel }}
                disabled={loading}
              >
                Cancelar
              </button>

              {showWarning ? (
                <button
                  onClick={handleConfirmReset}
                  style={{
                    ...styles.btn,
                    ...styles.btnWarning,
                    ...(loading ? styles.btnDisabled : {}),
                  }}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Confirmar y Reiniciar Contador'}
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(false)}
                  style={{
                    ...styles.btn,
                    ...styles.btnPrimary,
                    ...(loading || !reason.trim() ? styles.btnDisabled : {}),
                  }}
                  disabled={loading || !reason.trim()}
                >
                  {loading ? 'Procesando...' : 'Justificar'}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
