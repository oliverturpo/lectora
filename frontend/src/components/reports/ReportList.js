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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
  },
  itemName: {
    fontWeight: 500,
  },
  itemDesc: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  btn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

const reports = [
  {
    id: 'daily',
    name: 'Resumen Diario',
    desc: 'Reporte general del dia en PDF',
    icon: '📄',
    iconBg: '#dbeafe',
    format: 'pdf',
  },
  {
    id: 'excel',
    name: 'Asistencia Completa',
    desc: 'Listado completo en Excel',
    icon: '📊',
    iconBg: '#dcfce7',
    format: 'excel',
  },
  {
    id: 'tardiness',
    name: 'Reporte de Tardanzas',
    desc: 'Listado de tardanzas en Excel',
    icon: '⏰',
    iconBg: '#fef3c7',
    format: 'excel',
  },
  {
    id: 'absences',
    name: 'Reporte de Faltas',
    desc: 'Listado de faltas en Excel',
    icon: '❌',
    iconBg: '#fee2e2',
    format: 'excel',
  },
];

export default function ReportList({ onDownload, loading }) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Reportes Disponibles</h3>

      <div style={styles.list}>
        {reports.map((report) => (
          <div key={report.id} style={styles.item}>
            <div style={styles.itemInfo}>
              <div style={{ ...styles.icon, backgroundColor: report.iconBg }}>
                {report.icon}
              </div>
              <div>
                <div style={styles.itemName}>{report.name}</div>
                <div style={styles.itemDesc}>{report.desc}</div>
              </div>
            </div>
            <button
              onClick={() => onDownload(report.id, report.format)}
              disabled={loading}
              style={{
                ...styles.btn,
                ...(loading ? styles.btnDisabled : {}),
              }}
            >
              Descargar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
