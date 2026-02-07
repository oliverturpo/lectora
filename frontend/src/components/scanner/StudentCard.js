import React from 'react';
import { ATTENDANCE_STATUS } from '../../config/constants';

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  photo: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover',
    backgroundColor: '#e5e7eb',
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  grade: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  time: {
    fontSize: '0.75rem',
    color: '#6b7280',
    textAlign: 'right',
  },
  badge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.625rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
};

export default function StudentCard({ scan }) {
  const status = ATTENDANCE_STATUS[scan.status] || ATTENDANCE_STATUS.absent;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.card}>
      <div
        style={{
          ...styles.photo,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
        }}
      >
        👤
      </div>
      <div style={styles.info}>
        <div style={styles.name}>{scan.student_name || `DNI: ${scan.dni}`}</div>
        <div style={styles.grade}>
          {scan.grade} - {scan.section}
        </div>
      </div>
      <div>
        <div style={styles.time}>{formatTime(scan.scan_timestamp)}</div>
        <div
          style={{
            ...styles.badge,
            backgroundColor: `${status.color}20`,
            color: status.color,
          }}
        >
          {status.label}
        </div>
      </div>
    </div>
  );
}
