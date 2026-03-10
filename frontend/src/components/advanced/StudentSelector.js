import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { studentsAPI, reportsAPI } from '../../api/endpoints';
import { GRADES } from '../../config/constants';
import { getPhotoUrl } from '../../utils/photoUrl';
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

export default function StudentSelector() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const { isMobile } = useScreenSize();

  useEffect(() => {
    loadStudents();
  }, [gradeFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (gradeFilter) params.grade = gradeFilter;
      const response = await studentsAPI.list(params);
      setStudents(response.data.results || response.data);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(search.toLowerCase()) ||
    student.dni.includes(search)
  );

  const handleDownloadPDF = async (student) => {
    setDownloading(student.id);
    try {
      const response = await reportsAPI.exportStudentAttendancePdf(student.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const filename = `asistencia_${student.full_name.replace(/\s+/g, '_')}.pdf`;
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al descargar el PDF. Por favor intenta de nuevo.');
    } finally {
      setDownloading(null);
    }
  };

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '0.75rem' : '1rem',
      padding: isMobile ? '1rem' : '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    header: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#64748b',
      marginBottom: isMobile ? '1rem' : '1.25rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    filters: {
      display: 'flex',
      gap: isMobile ? '0.75rem' : '1rem',
      marginBottom: isMobile ? '1rem' : '1.5rem',
      flexDirection: isMobile ? 'column' : 'row',
    },
    searchInput: {
      padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: '2px solid #e2e8f0',
      fontSize: isMobile ? '1rem' : '0.875rem',
      flex: 1,
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    select: {
      padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: '2px solid #e2e8f0',
      fontSize: isMobile ? '1rem' : '0.875rem',
      minWidth: isMobile ? 'auto' : '180px',
      backgroundColor: 'white',
      cursor: 'pointer',
      outline: 'none',
    },
    count: {
      fontSize: isMobile ? '0.75rem' : '0.875rem',
      color: '#64748b',
      marginBottom: '1rem',
      fontWeight: 500,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: isMobile ? '0.75rem' : '1rem',
      maxHeight: '500px',
      overflowY: 'auto',
    },
    card: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.875rem' : '1rem',
      padding: isMobile ? '1rem' : '1.25rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    cardHover: {
      backgroundColor: 'white',
      borderColor: '#3b82f6',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
    },
    photo: {
      width: isMobile ? '56px' : '64px',
      height: isMobile ? '56px' : '64px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      flexShrink: 0,
    },
    photoPlaceholder: {
      width: isMobile ? '56px' : '64px',
      height: isMobile ? '56px' : '64px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '1.5rem' : '1.75rem',
      fontWeight: 'bold',
      color: 'white',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      fontWeight: '600',
      fontSize: isMobile ? '0.875rem' : '1rem',
      color: '#1e293b',
      marginBottom: '0.25rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    details: {
      fontSize: isMobile ? '0.75rem' : '0.875rem',
      color: '#64748b',
    },
    loading: {
      textAlign: 'center',
      padding: isMobile ? '2rem' : '3rem',
      color: '#64748b',
      fontSize: isMobile ? '0.875rem' : '1rem',
    },
    empty: {
      textAlign: 'center',
      padding: isMobile ? '2rem' : '3rem',
      color: '#94a3b8',
      fontSize: isMobile ? '0.875rem' : '1rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>Selecciona un Estudiante</div>

      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          style={styles.select}
        >
          <option value="">Todos los grados</option>
          {GRADES.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      {filteredStudents.length > 0 && (
        <div style={styles.count}>
          {filteredStudents.length} estudiante{filteredStudents.length !== 1 ? 's' : ''}
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Cargando estudiantes...</div>
      ) : filteredStudents.length === 0 ? (
        <div style={styles.empty}>No se encontraron estudiantes</div>
      ) : (
        <div style={styles.grid}>
          {filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              style={{
                ...styles.card,
                ...(downloading === student.id ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
              }}
              onClick={() => !downloading && handleDownloadPDF(student)}
              whileHover={!downloading ? styles.cardHover : {}}
              whileTap={!downloading ? { scale: 0.98 } : {}}
            >
              {student.photo ? (
                <img
                  src={getPhotoUrl(student.photo)}
                  alt={student.full_name}
                  style={styles.photo}
                />
              ) : (
                <div style={styles.photoPlaceholder}>
                  {student.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={styles.info}>
                <div style={styles.name}>{student.full_name}</div>
                <div style={styles.details}>
                  {downloading === student.id ? (
                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                      📥 Descargando PDF...
                    </span>
                  ) : (
                    <>DNI: {student.dni} • {student.grade}° {student.section}</>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
