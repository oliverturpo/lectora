import React, { useState, useEffect } from 'react';
import { reportsAPI, statsAPI } from '../api/endpoints';
import Loading from '../components/common/Loading';
import { toast } from 'react-toastify';
import { useScreenSize } from '../hooks/useScreenSize';

const reports = [
  // Reportes del día (por fecha seleccionada)
  {
    id: 'dia-pdf',
    name: 'Reporte del Día PDF',
    desc: 'Asistencia de la fecha',
    icon: '📄',
    iconBg: '#dbeafe',
    format: 'pdf',
  },
  {
    id: 'dia-excel',
    name: 'Reporte del Día Excel',
    desc: 'Asistencia de la fecha',
    icon: '📊',
    iconBg: '#dcfce7',
    format: 'excel',
  },
  // Reporte completo con historial
  {
    id: 'completo-excel',
    name: 'Registro Completo Excel',
    desc: 'Historial con % asistencia',
    icon: '📈',
    iconBg: '#e0e7ff',
    format: 'excel',
    isComplete: true,
  },
  // Reportes filtrados por estado
  {
    id: 'presentes-pdf',
    name: 'Solo Presentes',
    desc: 'Estudiantes puntuales',
    icon: '✅',
    iconBg: '#dcfce7',
    format: 'pdf',
    filter: 'present',
  },
  {
    id: 'tardanzas-pdf',
    name: 'Solo Tardanzas',
    desc: 'Estudiantes tarde',
    icon: '⏰',
    iconBg: '#fef3c7',
    format: 'pdf',
    filter: 'late',
  },
  {
    id: 'faltas-pdf',
    name: 'Solo Faltas',
    desc: 'Estudiantes ausentes',
    icon: '❌',
    iconBg: '#fee2e2',
    format: 'pdf',
    filter: 'absent',
  },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [grade, setGrade] = useState('');
  const [stats, setStats] = useState({ total: 0, present: 0, late: 0, absent: 0 });
  const { isMobile, isTablet } = useScreenSize();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await statsAPI.today();
        setStats(response.data);
      } catch (error) {
        console.error('Error cargando estadisticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [date]);

  const handleDownload = async (report) => {
    setDownloading(true);
    try {
      let response;
      const params = { date };
      if (grade) params.grade = grade;
      if (report.filter) params.status = report.filter;

      if (report.isComplete) {
        // Reporte completo con historial y porcentajes
        const completeParams = {};
        if (grade) completeParams.grade = grade;
        response = await reportsAPI.exportCompleteAttendanceExcel(completeParams);
      } else if (report.format === 'pdf') {
        response = await reportsAPI.exportPdf(params);
      } else {
        response = await reportsAPI.exportExcel(params);
      }

      const blob = new Blob([response.data], {
        type: report.format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      let filename;
      if (report.isComplete) {
        filename = `registro_completo_asistencia`;
        if (grade) filename += `_${grade}`;
        filename += '.xlsx';
      } else {
        filename = `reporte_${report.id}_${date}`;
        if (grade) filename += `_${grade}`;
        filename += report.format === 'pdf' ? '.pdf' : '.xlsx';
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Reporte descargado correctamente');
    } catch (error) {
      toast.error('Error al descargar reporte');
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-PE', {
      weekday: isMobile ? 'short' : 'long',
      day: 'numeric',
      month: isMobile ? 'short' : 'long',
      year: 'numeric'
    });
  };

  const total = Math.max(0, stats.total || 0);
  const present = Math.max(0, stats.present || 0);
  const late = Math.max(0, stats.late || 0);
  const absent = Math.max(0, stats.absent || 0);

  const presentPercent = total > 0 ? Math.min(100, Math.round((present / total) * 100)) : 0;
  const latePercent = total > 0 ? Math.min(100, Math.round((late / total) * 100)) : 0;
  const absentPercent = total > 0 ? Math.min(100, Math.round((absent / total) * 100)) : 0;

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      marginBottom: isMobile ? '1rem' : '2rem',
    },
    title: {
      fontSize: isMobile ? '1.25rem' : '1.75rem',
      fontWeight: 700,
      color: '#1e293b',
    },
    subtitle: {
      color: '#64748b',
      marginTop: '0.5rem',
      fontSize: isMobile ? '0.8rem' : '1rem',
    },
    filtersCard: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '0.75rem' : '1rem',
      padding: isMobile ? '1rem' : '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: isMobile ? '1rem' : '1.5rem',
    },
    filtersTitle: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#64748b',
      marginBottom: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    filtersRow: {
      display: 'flex',
      gap: '1rem',
      flexDirection: isMobile ? 'column' : 'row',
      flexWrap: 'wrap',
      alignItems: isMobile ? 'stretch' : 'flex-end',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      flex: isMobile ? '1' : 'none',
    },
    filterLabel: {
      fontSize: '0.75rem',
      fontWeight: 500,
      color: '#64748b',
    },
    input: {
      padding: isMobile ? '0.875rem' : '0.75rem 1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '0.5rem',
      fontSize: isMobile ? '1rem' : '0.875rem',
      width: '100%',
      minWidth: isMobile ? 'auto' : '180px',
      transition: 'border-color 0.2s',
      outline: 'none',
    },
    select: {
      padding: isMobile ? '0.875rem' : '0.75rem 1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '0.5rem',
      fontSize: isMobile ? '1rem' : '0.875rem',
      backgroundColor: 'white',
      width: '100%',
      minWidth: isMobile ? 'auto' : '180px',
      cursor: 'pointer',
      outline: 'none',
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr',
      gap: isMobile ? '1rem' : '1.5rem',
    },
    statsCard: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '0.75rem' : '1rem',
      padding: isMobile ? '1rem' : '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    statsHeader: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '0.5rem' : '0',
      marginBottom: '1.5rem',
    },
    statsTitle: {
      fontSize: isMobile ? '1rem' : '1.125rem',
      fontWeight: 600,
      color: '#1e293b',
    },
    statsDate: {
      fontSize: isMobile ? '0.75rem' : '0.875rem',
      color: '#64748b',
      backgroundColor: '#f1f5f9',
      padding: '0.375rem 0.75rem',
      borderRadius: '0.375rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: isMobile ? '0.5rem' : '1rem',
      marginBottom: '1.5rem',
    },
    statBox: {
      padding: isMobile ? '0.875rem' : '1.25rem',
      borderRadius: '0.75rem',
      textAlign: 'center',
    },
    statValue: {
      fontSize: isMobile ? '1.75rem' : '2.5rem',
      fontWeight: 700,
      lineHeight: 1,
    },
    statLabel: {
      fontSize: isMobile ? '0.65rem' : '0.75rem',
      fontWeight: 500,
      marginTop: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    progressSection: {
      marginTop: '1rem',
    },
    progressItem: {
      marginBottom: '1rem',
    },
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
    },
    progressLabel: {
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      fontWeight: 500,
      color: '#475569',
    },
    progressValue: {
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      fontWeight: 600,
    },
    progressBar: {
      height: '8px',
      backgroundColor: '#e2e8f0',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.5s ease',
    },
    reportsCard: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '0.75rem' : '1rem',
      padding: isMobile ? '1rem' : '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    reportsTitle: {
      fontSize: isMobile ? '1rem' : '1.125rem',
      fontWeight: 600,
      color: '#1e293b',
      marginBottom: '1rem',
    },
    reportsList: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: '0.75rem',
    },
    reportItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0.875rem' : '1rem 1.25rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s',
    },
    reportInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.75rem' : '1rem',
      flex: 1,
      minWidth: 0,
    },
    reportIcon: {
      width: isMobile ? '40px' : '48px',
      height: isMobile ? '40px' : '48px',
      borderRadius: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      flexShrink: 0,
    },
    reportText: {
      minWidth: 0,
    },
    reportName: {
      fontWeight: 600,
      color: '#1e293b',
      marginBottom: '0.125rem',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    reportDesc: {
      fontSize: isMobile ? '0.65rem' : '0.75rem',
      color: '#64748b',
    },
    downloadBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '0.5rem 0.75rem' : '0.625rem 1rem',
      backgroundColor: '#1e40af',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: isMobile ? '0.75rem' : '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      flexShrink: 0,
    },
    downloadBtnDisabled: {
      backgroundColor: '#94a3b8',
      cursor: 'not-allowed',
    },
  };

  if (loading) {
    return <Loading text="Cargando reportes..." />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Centro de Reportes</h1>
        <p style={styles.subtitle}>Genera y descarga reportes de asistencia</p>
      </div>

      <div style={styles.filtersCard}>
        <div style={styles.filtersTitle}>Filtros del Reporte</div>
        <div style={styles.filtersRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Grado</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              style={styles.select}
            >
              <option value="">Todos los grados</option>
              <option value="1ro">1ro Secundaria</option>
              <option value="2do">2do Secundaria</option>
              <option value="3ro">3ro Secundaria</option>
              <option value="4to">4to Secundaria</option>
              <option value="5to">5to Secundaria</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.statsCard}>
          <div style={styles.statsHeader}>
            <h3 style={styles.statsTitle}>Estadisticas</h3>
            <span style={styles.statsDate}>{formatDate(date)}</span>
          </div>

          <div style={styles.statsGrid}>
            <div style={{ ...styles.statBox, backgroundColor: '#eff6ff' }}>
              <div style={{ ...styles.statValue, color: '#1e40af' }}>{total}</div>
              <div style={{ ...styles.statLabel, color: '#3b82f6' }}>Total</div>
            </div>
            <div style={{ ...styles.statBox, backgroundColor: '#f0fdf4' }}>
              <div style={{ ...styles.statValue, color: '#16a34a' }}>{present}</div>
              <div style={{ ...styles.statLabel, color: '#22c55e' }}>Presentes</div>
            </div>
            <div style={{ ...styles.statBox, backgroundColor: '#fefce8' }}>
              <div style={{ ...styles.statValue, color: '#ca8a04' }}>{late}</div>
              <div style={{ ...styles.statLabel, color: '#eab308' }}>Tardanzas</div>
            </div>
            <div style={{ ...styles.statBox, backgroundColor: '#fef2f2' }}>
              <div style={{ ...styles.statValue, color: '#dc2626' }}>{absent}</div>
              <div style={{ ...styles.statLabel, color: '#ef4444' }}>Faltas</div>
            </div>
          </div>

          <div style={styles.progressSection}>
            <div style={styles.progressItem}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Presentes</span>
                <span style={{ ...styles.progressValue, color: '#16a34a' }}>{presentPercent}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${presentPercent}%`, backgroundColor: '#22c55e' }} />
              </div>
            </div>
            <div style={styles.progressItem}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Tardanzas</span>
                <span style={{ ...styles.progressValue, color: '#ca8a04' }}>{latePercent}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${latePercent}%`, backgroundColor: '#eab308' }} />
              </div>
            </div>
            <div style={styles.progressItem}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Faltas</span>
                <span style={{ ...styles.progressValue, color: '#dc2626' }}>{absentPercent}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${absentPercent}%`, backgroundColor: '#ef4444' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={styles.reportsCard}>
          <h3 style={styles.reportsTitle}>Descargar Reportes</h3>
          <div style={styles.reportsList}>
            {reports.map((report) => (
              <div key={report.id} style={styles.reportItem}>
                <div style={styles.reportInfo}>
                  <div style={{ ...styles.reportIcon, backgroundColor: report.iconBg }}>
                    {report.icon}
                  </div>
                  <div style={styles.reportText}>
                    <div style={styles.reportName}>{report.name}</div>
                    <div style={styles.reportDesc}>{report.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(report)}
                  disabled={downloading}
                  style={{
                    ...styles.downloadBtn,
                    ...(downloading ? styles.downloadBtnDisabled : {}),
                  }}
                >
                  {downloading ? '...' : report.format === 'pdf' ? 'PDF' : 'XLS'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
