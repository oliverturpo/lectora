import React, { useState, useEffect } from 'react';
import { configAPI } from '../api/endpoints';
import Loading from '../components/common/Loading';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useScreenSize';

const defaultConfig = {
  open_time: '07:30',
  punctuality_limit: '07:45',
  close_time: '08:00',
  working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  institution_name: '',
};

const dayLabels = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mie',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sab',
  sunday: 'Dom',
};

const dayLabelsFull = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miercoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sabado',
  sunday: 'Domingo',
};

export default function ConfigPage() {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await configAPI.get();
        setConfig({ ...defaultConfig, ...response.data });
      } catch (error) {
        console.error('Error cargando configuracion:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day) => {
    setConfig((prev) => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter((d) => d !== day)
        : [...prev.working_days, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await configAPI.update(config);
      toast.success('Configuracion guardada');
    } catch (error) {
      toast.error('Error al guardar configuracion');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultConfig);
  };

  const styles = {
    header: {
      marginBottom: isMobile ? '1rem' : '1.5rem',
    },
    title: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: 600,
    },
    subtitle: {
      color: '#6b7280',
      marginTop: '0.25rem',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: isMobile ? '1rem' : '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: isMobile ? '1rem' : '1.5rem',
    },
    cardTitle: {
      fontSize: isMobile ? '1rem' : '1.125rem',
      fontWeight: 600,
      marginBottom: '1rem',
      paddingBottom: '0.75rem',
      borderBottom: '1px solid #e5e7eb',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
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
    checkboxGroup: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(7, 1fr)',
      gap: isMobile ? '0.5rem' : '1rem',
    },
    checkboxLabel: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      gap: isMobile ? '0.25rem' : '0.5rem',
      fontSize: isMobile ? '0.75rem' : '0.875rem',
      cursor: 'pointer',
      padding: isMobile ? '0.5rem' : '0',
      backgroundColor: isMobile ? '#f9fafb' : 'transparent',
      borderRadius: isMobile ? '0.5rem' : '0',
      textAlign: 'center',
    },
    checkbox: {
      width: isMobile ? '20px' : '16px',
      height: isMobile ? '20px' : '16px',
      accentColor: '#1e40af',
    },
    actions: {
      display: 'flex',
      justifyContent: isMobile ? 'stretch' : 'flex-end',
      gap: '0.75rem',
      marginTop: '1rem',
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
  };

  if (loading) {
    return <Loading text="Cargando configuracion..." />;
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Configuracion</h1>
        <p style={styles.subtitle}>Ajusta los parametros del sistema</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Horarios de Asistencia</h2>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Hora de Apertura</label>
              <input
                type="time"
                value={config.open_time}
                onChange={(e) => handleChange('open_time', e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Limite de Puntualidad</label>
              <input
                type="time"
                value={config.punctuality_limit}
                onChange={(e) => handleChange('punctuality_limit', e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Hora de Cierre</label>
              <input
                type="time"
                value={config.close_time}
                onChange={(e) => handleChange('close_time', e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Dias Laborables</h2>
          <div style={styles.checkboxGroup}>
            {Object.entries(isMobile ? dayLabels : dayLabelsFull).map(([day, label]) => (
              <label key={day} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={config.working_days.includes(day)}
                  onChange={() => handleDayToggle(day)}
                  style={styles.checkbox}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Informacion Institucional</h2>
          <div style={styles.field}>
            <label style={styles.label}>Nombre de la Institucion</label>
            <input
              type="text"
              value={config.institution_name}
              onChange={(e) => handleChange('institution_name', e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={handleReset}
            style={{ ...styles.btn, ...styles.btnSecondary }}
          >
            Restaurar
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ ...styles.btn, ...styles.btnPrimary }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
