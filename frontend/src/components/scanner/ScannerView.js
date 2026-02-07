import React, { useRef, useEffect } from 'react';

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: '#1e40af',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    maxWidth: '400px',
    padding: '1rem 1.5rem',
    fontSize: '1.5rem',
    textAlign: 'center',
    border: '3px solid #1e40af',
    borderRadius: '0.75rem',
    outline: 'none',
    letterSpacing: '0.25rem',
  },
  hint: {
    marginTop: '1rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  status: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
  },
  connected: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  disconnected: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
};

export default function ScannerView({ onScan, isConnected, value, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dni = value.trim();
    if (dni.length === 8 && /^\d+$/.test(dni)) {
      onScan(dni);
    }
  };

  const handleBlur = () => {
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Escanear Codigo de Barras</h2>

      <form onSubmit={handleSubmit}>
        <div style={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="DNI"
            maxLength={8}
            style={styles.input}
            autoComplete="off"
          />
        </div>
      </form>

      <p style={styles.hint}>
        Escanea el codigo de barras del carnet del estudiante
      </p>

      <div
        style={{
          ...styles.status,
          ...(isConnected ? styles.connected : styles.disconnected),
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#22c55e' : '#ef4444',
          }}
        />
        {isConnected ? 'Sistema conectado' : 'Sistema desconectado'}
      </div>
    </div>
  );
}
