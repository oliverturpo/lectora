import React, { useState, useEffect } from 'react';
import { getPhotoUrl } from '../../utils/photoUrl';

// Hook para detectar tamaño de pantalla
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export default function StudentCard({ student, onEdit, onDelete, onViewCarnet }) {
  const isMobile = useIsMobile();
  const fullName = `${student.paternal_surname} ${student.maternal_surname}, ${student.first_name}`;

  const styles = {
    card: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: isMobile ? '0.75rem' : '1rem',
      padding: isMobile ? '0.875rem' : '1rem',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    topRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    photo: {
      width: isMobile ? '50px' : '60px',
      height: isMobile ? '50px' : '60px',
      borderRadius: '0.5rem',
      objectFit: 'cover',
      backgroundColor: '#e5e7eb',
      flexShrink: 0,
    },
    photoPlaceholder: {
      width: isMobile ? '50px' : '60px',
      height: isMobile ? '50px' : '60px',
      borderRadius: '0.5rem',
      backgroundColor: '#e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      flexShrink: 0,
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      fontWeight: 600,
      marginBottom: '0.125rem',
      fontSize: isMobile ? '0.875rem' : '1rem',
      whiteSpace: isMobile ? 'nowrap' : 'normal',
      overflow: isMobile ? 'hidden' : 'visible',
      textOverflow: isMobile ? 'ellipsis' : 'clip',
    },
    details: {
      fontSize: isMobile ? '0.75rem' : '0.875rem',
      color: '#6b7280',
    },
    actions: {
      display: 'flex',
      gap: '0.5rem',
      justifyContent: isMobile ? 'flex-end' : 'flex-start',
      flexWrap: 'wrap',
    },
    btn: {
      padding: isMobile ? '0.5rem 0.75rem' : '0.375rem 0.75rem',
      fontSize: '0.75rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      flex: isMobile ? '1' : 'none',
      textAlign: 'center',
    },
    btnEdit: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
    },
    btnDelete: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    },
    btnCarnet: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
  };

  if (isMobile) {
    return (
      <div style={styles.card}>
        <div style={styles.topRow}>
          {student.photo ? (
            <img src={getPhotoUrl(student.photo)} alt={fullName} style={styles.photo} />
          ) : (
            <div style={styles.photoPlaceholder}>👤</div>
          )}
          <div style={styles.info}>
            <div style={styles.name}>{fullName}</div>
            <div style={styles.details}>
              DNI: {student.dni} | {student.grade}-{student.section}
            </div>
          </div>
        </div>
        <div style={styles.actions}>
          <button
            onClick={() => onViewCarnet?.(student)}
            style={{ ...styles.btn, ...styles.btnCarnet }}
          >
            Carnet
          </button>
          <button
            onClick={() => onEdit?.(student)}
            style={{ ...styles.btn, ...styles.btnEdit }}
          >
            Editar
          </button>
          <button
            onClick={() => onDelete?.(student)}
            style={{ ...styles.btn, ...styles.btnDelete }}
          >
            Eliminar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      {student.photo ? (
        <img src={getPhotoUrl(student.photo)} alt={fullName} style={styles.photo} />
      ) : (
        <div style={styles.photoPlaceholder}>👤</div>
      )}
      <div style={styles.info}>
        <div style={styles.name}>{fullName}</div>
        <div style={styles.details}>
          DNI: {student.dni} | {student.grade} - {student.section}
        </div>
      </div>
      <div style={styles.actions}>
        <button
          onClick={() => onViewCarnet?.(student)}
          style={{ ...styles.btn, ...styles.btnCarnet }}
        >
          Ver Carnet
        </button>
        <button
          onClick={() => onEdit?.(student)}
          style={{ ...styles.btn, ...styles.btnEdit }}
        >
          Editar
        </button>
        <button
          onClick={() => onDelete?.(student)}
          style={{ ...styles.btn, ...styles.btnDelete }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
