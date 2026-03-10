import React, { useState, useEffect, useCallback } from 'react';
import { studentsAPI } from '../api/endpoints';
import StudentList from '../components/students/StudentList';
import StudentForm from '../components/students/StudentForm';
import StudentIDCard from '../components/students/StudentIDCard';
import BulkCarnetDownload from '../components/students/BulkCarnetDownload';
import PrintableCarnets from '../components/students/PrintableCarnets';
import Loading from '../components/common/Loading';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useScreenSize';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', grade: '', section: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [viewingCarnet, setViewingCarnet] = useState(null);
  const [showBulkDownload, setShowBulkDownload] = useState(false);
  const [showPrintable, setShowPrintable] = useState(false);
  const isMobile = useIsMobile();

  const fetchStudents = useCallback(async () => {
    try {
      const params = {};
      if (filters.grade) params.grade = filters.grade;
      if (filters.section) params.section = filters.section;

      const response = await studentsAPI.list(params);
      let data = response.data.results || response.data || [];

      // Filtro de busqueda local
      if (filters.search) {
        const search = filters.search.toLowerCase();
        data = data.filter(
          (s) =>
            s.dni.includes(search) ||
            s.first_name.toLowerCase().includes(search) ||
            s.paternal_surname.toLowerCase().includes(search) ||
            s.maternal_surname.toLowerCase().includes(search)
        );
      }

      setStudents(data);
    } catch (error) {
      toast.error('Error al cargar estudiantes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSave = async (data, isFormData = false) => {
    try {
      if (editingStudent) {
        if (isFormData) {
          await studentsAPI.updateWithPhoto(editingStudent.id, data);
        } else {
          await studentsAPI.update(editingStudent.id, data);
        }
        toast.success('Estudiante actualizado');
      } else {
        if (isFormData) {
          await studentsAPI.createWithPhoto(data);
        } else {
          await studentsAPI.create(data);
        }
        toast.success('Estudiante creado');
      }
      setShowForm(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      throw error;
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;

    try {
      await studentsAPI.delete(deletingStudent.id);
      toast.success('Estudiante eliminado');
      setDeletingStudent(null);
      fetchStudents();
    } catch (error) {
      toast.error('Error al eliminar estudiante');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const styles = {
    header: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: isMobile ? '1rem' : '0',
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: 600,
    },
    addBtn: {
      padding: isMobile ? '0.75rem 1rem' : '0.625rem 1.25rem',
      backgroundColor: '#1e40af',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      textAlign: 'center',
    },
    bulkBtn: {
      padding: isMobile ? '0.75rem 1rem' : '0.625rem 1.25rem',
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    printBtn: {
      padding: isMobile ? '0.75rem 1rem' : '0.625rem 1.25rem',
      backgroundColor: '#7c3aed',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    headerButtons: {
      display: 'flex',
      gap: '0.75rem',
      flexDirection: isMobile ? 'column' : 'row',
    },
    confirmOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    },
    confirmModal: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: isMobile ? '1.25rem' : '1.5rem',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center',
    },
    confirmTitle: {
      fontSize: '1.125rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
    },
    confirmText: {
      color: '#6b7280',
      marginBottom: '1.5rem',
      fontSize: isMobile ? '0.875rem' : '1rem',
    },
    confirmActions: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'center',
      flexDirection: isMobile ? 'column-reverse' : 'row',
    },
    btn: {
      padding: isMobile ? '0.75rem 1rem' : '0.5rem 1rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      border: 'none',
      flex: isMobile ? 1 : 'none',
    },
  };

  if (loading) {
    return <Loading text="Cargando estudiantes..." />;
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestion de Estudiantes</h1>
        <div style={styles.headerButtons}>
          <button
            onClick={() => setShowPrintable(true)}
            style={styles.printBtn}
            disabled={students.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            PDF Imprimir
          </button>
          <button
            onClick={() => setShowBulkDownload(true)}
            style={styles.bulkBtn}
            disabled={students.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            ZIP Carnets
          </button>
          <button onClick={() => setShowForm(true)} style={styles.addBtn}>
            + Nuevo Estudiante
          </button>
        </div>
      </div>

      <StudentList
        students={students}
        filters={filters}
        onFilterChange={setFilters}
        onEdit={handleEdit}
        onDelete={setDeletingStudent}
        onViewCarnet={setViewingCarnet}
      />

      {showForm && (
        <StudentForm
          student={editingStudent}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}

      {deletingStudent && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmModal}>
            <h3 style={styles.confirmTitle}>Confirmar eliminacion</h3>
            <p style={styles.confirmText}>
              Estas seguro de eliminar a {deletingStudent.first_name}{' '}
              {deletingStudent.paternal_surname}?
            </p>
            <div style={styles.confirmActions}>
              <button
                onClick={() => setDeletingStudent(null)}
                style={{ ...styles.btn, backgroundColor: '#e5e7eb' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                style={{ ...styles.btn, backgroundColor: '#ef4444', color: 'white' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingCarnet && (
        <StudentIDCard
          student={viewingCarnet}
          onClose={() => setViewingCarnet(null)}
        />
      )}

      {showBulkDownload && (
        <BulkCarnetDownload
          students={students}
          onClose={() => setShowBulkDownload(false)}
        />
      )}

      {showPrintable && (
        <PrintableCarnets
          students={students}
          onClose={() => setShowPrintable(false)}
        />
      )}
    </div>
  );
}
