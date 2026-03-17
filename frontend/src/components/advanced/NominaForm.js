import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { reportsAPI } from '../../api/endpoints';
import { GRADES, SECTIONS_BY_GRADE } from '../../config/constants';
import { saveAs } from 'file-saver';

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

export default function NominaForm() {
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const { isMobile } = useScreenSize();

  const handleDownloadByGrade = async () => {
    if (!grade) {
      setError('Por favor selecciona un grado');
      return;
    }
    setError('');
    setDownloading(true);
    try {
      const params = { grade };
      if (section) params.section = section;
      const response = await reportsAPI.exportNominaByGrade(params);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const filename = `nomina_${grade}_${section || 'todas'}.pdf`;
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error descargando nómina:', error);
      setError('Error al descargar la nómina. Por favor intenta de nuevo.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadOficial = async () => {
    setError('');
    setDownloading(true);
    try {
      const response = await reportsAPI.exportNominaOficialExcel();
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const year = new Date().getFullYear();
      saveAs(blob, `nomina_oficial_${year}.xlsx`);
    } catch (error) {
      console.error('Error descargando nómina oficial:', error);
      setError('Error al descargar la nómina oficial. Por favor intenta de nuevo.');
    } finally {
      setDownloading(false);
    }
  };

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isMobile ? '1rem' : '1.5rem',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '0.75rem' : '1rem',
      padding: isMobile ? '1.25rem' : '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: isMobile ? '1rem' : '1.25rem',
      paddingBottom: isMobile ? '0.75rem' : '1rem',
      borderBottom: '2px solid #e2e8f0',
    },
    icon: {
      width: isMobile ? '40px' : '48px',
      height: isMobile ? '40px' : '48px',
      borderRadius: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    title: {
      fontSize: isMobile ? '1rem' : '1.125rem',
      fontWeight: '700',
      color: '#1e293b',
    },
    description: {
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      color: '#64748b',
      marginBottom: isMobile ? '1rem' : '1.25rem',
      lineHeight: '1.5',
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? '0.75rem' : '1rem',
      marginBottom: isMobile ? '1rem' : '1.25rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: isMobile ? '0.75rem' : '0.875rem',
      fontWeight: '600',
      color: '#475569',
    },
    select: {
      padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: '2px solid #e2e8f0',
      fontSize: isMobile ? '1rem' : '0.875rem',
      backgroundColor: 'white',
      cursor: 'pointer',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    button: {
      width: '100%',
      padding: isMobile ? '1rem' : '1rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontSize: isMobile ? '0.95rem' : '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      color: 'white',
    },
    successButton: {
      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      color: 'white',
    },
    disabledButton: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    error: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      padding: isMobile ? '0.75rem' : '1rem',
      borderRadius: '0.5rem',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      marginBottom: isMobile ? '1rem' : '1.25rem',
      border: '1px solid #fecaca',
    },
  };

  return (
    <>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.error}
        >
          {error}
        </motion.div>
      )}

      <div style={styles.container}>
        {/* Card 1: Nómina por Grado y Sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.card}
        >
          <div style={styles.header}>
            <div style={{ ...styles.icon, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
              📋
            </div>
            <div style={styles.title}>Nómina por Grado</div>
          </div>
          <p style={styles.description}>
            Genera una nómina en PDF con la lista de estudiantes filtrada por grado y opcionalmente por sección.
          </p>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Grado *</label>
              <select
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setSection(''); // Reset section when grade changes
                }}
                style={styles.select}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                <option value="">Selecciona...</option>
                {GRADES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Sección</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                style={styles.select}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                disabled={!grade}
              >
                <option value="">Todas</option>
                {grade && SECTIONS_BY_GRADE[grade]?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <motion.button
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(downloading || !grade ? styles.disabledButton : {}),
            }}
            onClick={handleDownloadByGrade}
            disabled={downloading || !grade}
            whileHover={!downloading && grade ? { scale: 1.02 } : {}}
            whileTap={!downloading && grade ? { scale: 0.98 } : {}}
          >
            <span>📥</span>
            {downloading ? 'Descargando...' : 'Descargar PDF'}
          </motion.button>
        </motion.div>

        {/* Card 2: Nómina Oficial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.card}
        >
          <div style={styles.header}>
            <div style={{ ...styles.icon, background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
              📄
            </div>
            <div style={styles.title}>Nómina Oficial</div>
          </div>
          <p style={styles.description}>
            Genera la nómina oficial en Excel con todos los estudiantes activos del colegio.
            Cada hoja corresponde a un grado y sección. Incluye un resumen estadístico.
          </p>
          <div style={{ marginBottom: isMobile ? '1rem' : '1.25rem', minHeight: isMobile ? '90px' : '96px' }}>
            {/* Espacio para mantener el botón alineado con el card de al lado */}
          </div>
          <motion.button
            style={{
              ...styles.button,
              ...styles.successButton,
              ...(downloading ? styles.disabledButton : {}),
            }}
            onClick={handleDownloadOficial}
            disabled={downloading}
            whileHover={!downloading ? { scale: 1.02 } : {}}
            whileTap={!downloading ? { scale: 0.98 } : {}}
          >
            <span>📥</span>
            {downloading ? 'Descargando...' : 'Descargar Excel Oficial'}
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
