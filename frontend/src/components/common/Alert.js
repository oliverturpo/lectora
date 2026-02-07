import React from 'react';

const styles = {
  base: {
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #86efac',
  },
  warning: {
    backgroundColor: '#fef9c3',
    color: '#854d0e',
    border: '1px solid #fde047',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
  },
  info: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    border: '1px solid #93c5fd',
  },
};

export default function Alert({ type = 'info', children, onClose }) {
  const typeStyles = styles[type] || styles.info;

  return (
    <div style={{ ...styles.base, ...typeStyles }}>
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            lineHeight: 1,
            opacity: 0.5,
          }}
        >
          x
        </button>
      )}
    </div>
  );
}
