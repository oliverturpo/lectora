import React, { useState, useEffect } from 'react';
import StudentCard from './StudentCard';
import { SECTIONS_BY_GRADE, ALL_SECTIONS } from '../../config/constants';

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

export default function StudentList({
  students,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
  onViewCarnet,
}) {
  const isMobile = useIsMobile();
  const grades = ['', '1ro', '2do', '3ro', '4to', '5to'];

  // Obtener secciones según el grado seleccionado
  const getSectionsForFilter = () => {
    if (filters.grade && SECTIONS_BY_GRADE[filters.grade]) {
      return SECTIONS_BY_GRADE[filters.grade];
    }
    return ALL_SECTIONS;
  };
  const sections = getSectionsForFilter();

  const styles = {
    filters: {
      display: 'flex',
      gap: isMobile ? '0.75rem' : '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      flexDirection: isMobile ? 'column' : 'row',
    },
    select: {
      padding: isMobile ? '0.75rem 1rem' : '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      fontSize: isMobile ? '1rem' : '0.875rem',
      minWidth: isMobile ? 'auto' : '150px',
      width: isMobile ? '100%' : 'auto',
      backgroundColor: 'white',
    },
    searchInput: {
      padding: isMobile ? '0.75rem 1rem' : '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      fontSize: isMobile ? '1rem' : '0.875rem',
      flex: 1,
      minWidth: isMobile ? 'auto' : '200px',
      width: isMobile ? '100%' : 'auto',
    },
    selectsRow: {
      display: 'flex',
      gap: '0.75rem',
      width: isMobile ? '100%' : 'auto',
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '0.5rem' : '0.75rem',
    },
    empty: {
      textAlign: 'center',
      padding: isMobile ? '2rem' : '3rem',
      color: '#9ca3af',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      fontSize: isMobile ? '0.875rem' : '1rem',
    },
    count: {
      fontSize: isMobile ? '0.75rem' : '0.875rem',
      color: '#6b7280',
      marginBottom: '1rem',
    },
  };

  return (
    <div>
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          style={styles.searchInput}
        />
        <div style={styles.selectsRow}>
          <select
            value={filters.grade || ''}
            onChange={(e) => {
              const newGrade = e.target.value;
              // Reset section when grade changes (section might not be valid for new grade)
              onFilterChange({ ...filters, grade: newGrade, section: '' });
            }}
            style={{ ...styles.select, flex: 1 }}
          >
            <option value="">Grados</option>
            {grades.slice(1).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select
            value={filters.section || ''}
            onChange={(e) => onFilterChange({ ...filters, section: e.target.value })}
            style={{ ...styles.select, flex: 1 }}
          >
            <option value="">Secciones</option>
            {sections.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.count}>
        {students.length} estudiante{students.length !== 1 ? 's' : ''}
      </div>

      {students.length === 0 ? (
        <div style={styles.empty}>
          No se encontraron estudiantes
        </div>
      ) : (
        <div style={styles.list}>
          {students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewCarnet={onViewCarnet}
            />
          ))}
        </div>
      )}
    </div>
  );
}
