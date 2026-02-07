import React from 'react';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTopColor: '#1e40af',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  fullPage: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
};

export default function Loading({ text = 'Cargando...', fullPage = false }) {
  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ ...styles.container, ...(fullPage ? styles.fullPage : {}) }}>
        <div style={styles.spinner}></div>
        {text && <p style={styles.text}>{text}</p>}
      </div>
    </>
  );
}
