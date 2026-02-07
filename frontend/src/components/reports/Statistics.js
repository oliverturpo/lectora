import React from 'react';

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '1rem',
  },
  stat: {
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
  },
  value: {
    fontSize: '1.75rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  label: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.5rem',
  },
  bar: {
    marginTop: '1.5rem',
  },
  barLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  barTrack: {
    height: '12px',
    backgroundColor: '#e5e7eb',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 300ms ease',
  },
};

export default function Statistics({ stats }) {
  const total = stats.total || 0;
  const present = stats.present || 0;
  const late = stats.late || 0;
  const absent = stats.absent || 0;

  const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;
  const latePercent = total > 0 ? Math.round((late / total) * 100) : 0;
  const absentPercent = total > 0 ? Math.round((absent / total) * 100) : 0;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Estadisticas del Dia</h3>

      <div style={styles.grid}>
        <div style={styles.stat}>
          <div style={{ ...styles.value, color: '#1e40af' }}>{total}</div>
          <div style={styles.label}>Total</div>
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.value, color: '#22c55e' }}>{present}</div>
          <div style={styles.label}>Presentes</div>
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.value, color: '#eab308' }}>{late}</div>
          <div style={styles.label}>Tardanzas</div>
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.value, color: '#ef4444' }}>{absent}</div>
          <div style={styles.label}>Faltas</div>
        </div>
      </div>

      <div style={styles.bar}>
        <div style={styles.barLabel}>
          <span>Asistencia</span>
          <span>{presentPercent}%</span>
        </div>
        <div style={styles.barTrack}>
          <div
            style={{
              ...styles.barFill,
              width: `${presentPercent}%`,
              backgroundColor: '#22c55e',
            }}
          />
        </div>
      </div>

      <div style={styles.bar}>
        <div style={styles.barLabel}>
          <span>Tardanzas</span>
          <span>{latePercent}%</span>
        </div>
        <div style={styles.barTrack}>
          <div
            style={{
              ...styles.barFill,
              width: `${latePercent}%`,
              backgroundColor: '#eab308',
            }}
          />
        </div>
      </div>

      <div style={styles.bar}>
        <div style={styles.barLabel}>
          <span>Faltas</span>
          <span>{absentPercent}%</span>
        </div>
        <div style={styles.barTrack}>
          <div
            style={{
              ...styles.barFill,
              width: `${absentPercent}%`,
              backgroundColor: '#ef4444',
            }}
          />
        </div>
      </div>
    </div>
  );
}
