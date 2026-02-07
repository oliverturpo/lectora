import React from 'react';
import StudentCard from './StudentCard';

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontWeight: 600,
    fontSize: '1rem',
  },
  count: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#9ca3af',
  },
};

export default function AttendanceList({ scans, title = 'Ultimos Escaneos' }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        <span style={styles.count}>{scans.length} registros</span>
      </div>
      <div style={styles.list}>
        {scans.length === 0 ? (
          <div style={styles.empty}>No hay escaneos registrados</div>
        ) : (
          scans.map((scan, index) => (
            <StudentCard key={scan.id || index} scan={scan} />
          ))
        )}
      </div>
    </div>
  );
}
