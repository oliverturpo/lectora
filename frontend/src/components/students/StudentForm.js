import React, { useState, useEffect, useRef } from 'react';
import { GRADES, SECTIONS_BY_GRADE } from '../../config/constants';
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

const initialData = {
  dni: '',
  first_name: '',
  paternal_surname: '',
  maternal_surname: '',
  grade: '1ro',
  section: SECTIONS_BY_GRADE['1ro'][0],
};

// Funcion para capitalizar nombres: "CLIVER" -> "Cliver", "cliver oliver" -> "Cliver Oliver"
const capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Funcion para filtrar solo numeros en DNI
const onlyNumbers = (text) => {
  return text.replace(/[^0-9]/g, '');
};

export default function StudentForm({ student, onSave, onClose }) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (student) {
      const grade = student.grade || '1ro';
      const section = student.section || SECTIONS_BY_GRADE[grade][0];
      setFormData({
        dni: student.dni || '',
        first_name: student.first_name || '',
        paternal_surname: student.paternal_surname || '',
        maternal_surname: student.maternal_surname || '',
        grade: grade,
        section: section,
      });
      if (student.photo) {
        setPhotoPreview(getPhotoUrl(student.photo));
      }
    }
  }, [student]);

  const validate = () => {
    const newErrors = {};

    if (!formData.dni || !/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'DNI debe tener 8 digitos';
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nombres requeridos';
    }
    if (!formData.paternal_surname.trim()) {
      newErrors.paternal_surname = 'Apellido paterno requerido';
    }
    if (!formData.maternal_surname.trim()) {
      newErrors.maternal_surname = 'Apellido materno requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (photoFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('dni', formData.dni);
        formDataToSend.append('first_name', formData.first_name);
        formDataToSend.append('paternal_surname', formData.paternal_surname);
        formDataToSend.append('maternal_surname', formData.maternal_surname);
        formDataToSend.append('grade', formData.grade);
        formDataToSend.append('section', formData.section);
        formDataToSend.append('photo', photoFile);
        await onSave(formDataToSend, true);
      } else {
        await onSave(formData, false);
      }
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    let processedValue = value;

    // DNI: solo numeros, maximo 8
    if (field === 'dni') {
      processedValue = onlyNumbers(value).slice(0, 8);
    }

    // Nombres y apellidos: capitalizar cada palabra
    if (field === 'first_name' || field === 'paternal_surname' || field === 'maternal_surname') {
      processedValue = capitalizeWords(value);
    }

    // Si cambia el grado, resetear la sección a la primera del nuevo grado
    if (field === 'grade') {
      const newSections = SECTIONS_BY_GRADE[value] || [];
      setFormData((prev) => ({
        ...prev,
        grade: value,
        section: newSections[0] || '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: processedValue }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, photo: 'Solo se permiten imagenes' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: 'La imagen no debe superar 5MB' }));
        return;
      }

      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, photo: null }));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(student?.photo ? getPhotoUrl(student.photo) : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? 0 : '1rem',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '1rem 1rem 0 0' : '0.75rem',
      padding: isMobile ? '1.25rem' : '1.5rem',
      width: '100%',
      maxWidth: isMobile ? '100%' : '500px',
      maxHeight: isMobile ? '90vh' : '90vh',
      overflowY: 'auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.25rem',
    },
    title: {
      fontSize: isMobile ? '1.125rem' : '1.25rem',
      fontWeight: 600,
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#6b7280',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '1rem',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
    },
    label: {
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      fontWeight: 500,
      color: '#374151',
    },
    input: {
      padding: isMobile ? '0.75rem' : '0.625rem 0.875rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: isMobile ? '1rem' : '0.875rem',
      width: '100%',
    },
    select: {
      padding: isMobile ? '0.75rem' : '0.625rem 0.875rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: isMobile ? '1rem' : '0.875rem',
      backgroundColor: 'white',
      width: '100%',
    },
    error: {
      color: '#dc2626',
      fontSize: '0.75rem',
    },
    actions: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: isMobile ? 'stretch' : 'flex-end',
      marginTop: '0.5rem',
      flexDirection: isMobile ? 'column-reverse' : 'row',
    },
    btn: {
      padding: isMobile ? '0.875rem 1.25rem' : '0.625rem 1.25rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      border: 'none',
      textAlign: 'center',
    },
    btnPrimary: {
      backgroundColor: '#1e40af',
      color: 'white',
    },
    btnSecondary: {
      backgroundColor: '#e5e7eb',
      color: '#374151',
    },
    photoSection: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'center' : 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      border: '1px dashed #d1d5db',
    },
    photoPreview: {
      width: isMobile ? '100px' : '80px',
      height: isMobile ? '125px' : '100px',
      borderRadius: '0.5rem',
      objectFit: 'cover',
      backgroundColor: '#e5e7eb',
    },
    photoPlaceholder: {
      width: isMobile ? '100px' : '80px',
      height: isMobile ? '125px' : '100px',
      borderRadius: '0.5rem',
      backgroundColor: '#e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: '2rem',
    },
    photoActions: {
      flex: 1,
      textAlign: isMobile ? 'center' : 'left',
    },
    photoHint: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.5rem',
    },
    fileInput: {
      display: 'none',
    },
    uploadBtn: {
      padding: isMobile ? '0.625rem 1rem' : '0.5rem 1rem',
      backgroundColor: '#1e40af',
      color: 'white',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      cursor: 'pointer',
    },
    removeBtn: {
      padding: isMobile ? '0.625rem 1rem' : '0.5rem 1rem',
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      cursor: 'pointer',
      marginLeft: '0.5rem',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {student ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Foto del Estudiante</label>
            <div style={styles.photoSection}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={styles.photoPreview} />
              ) : (
                <div style={styles.photoPlaceholder}>👤</div>
              )}
              <div style={styles.photoActions}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={styles.fileInput}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={styles.uploadBtn}
                >
                  {photoPreview ? 'Cambiar foto' : 'Subir foto'}
                </button>
                {photoFile && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    style={styles.removeBtn}
                  >
                    Quitar
                  </button>
                )}
                <p style={styles.photoHint}>
                  JPG, PNG. Max 5MB
                </p>
              </div>
            </div>
            {errors.photo && <span style={styles.error}>{errors.photo}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>DNI (8 digitos)</label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.dni}
              onChange={(e) => handleChange('dni', e.target.value)}
              style={styles.input}
              placeholder="12345678"
            />
            {errors.dni && <span style={styles.error}>{errors.dni}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Nombres</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              style={styles.input}
              placeholder="Juan Carlos"
            />
            {errors.first_name && (
              <span style={styles.error}>{errors.first_name}</span>
            )}
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Apellido Paterno</label>
              <input
                type="text"
                value={formData.paternal_surname}
                onChange={(e) => handleChange('paternal_surname', e.target.value)}
                style={styles.input}
                placeholder="Perez"
              />
              {errors.paternal_surname && (
                <span style={styles.error}>{errors.paternal_surname}</span>
              )}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Apellido Materno</label>
              <input
                type="text"
                value={formData.maternal_surname}
                onChange={(e) => handleChange('maternal_surname', e.target.value)}
                style={styles.input}
                placeholder="Garcia"
              />
              {errors.maternal_surname && (
                <span style={styles.error}>{errors.maternal_surname}</span>
              )}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Grado</label>
              <select
                value={formData.grade}
                onChange={(e) => handleChange('grade', e.target.value)}
                style={styles.select}
              >
                {GRADES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Seccion</label>
              <select
                value={formData.section}
                onChange={(e) => handleChange('section', e.target.value)}
                style={styles.select}
              >
                {(SECTIONS_BY_GRADE[formData.grade] || []).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.btn, ...styles.btnSecondary }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.btn, ...styles.btnPrimary }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
