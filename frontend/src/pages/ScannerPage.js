import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAttendance } from '../contexts/AttendanceContext';
import { getPhotoUrl } from '../utils/photoUrl';
import { useSound } from '../hooks/useSound';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { useScreenSize } from '../hooks/useScreenSize';

export default function ScannerPage() {
  const { stats, recentScans, isConnected, scanAttendance } = useAttendance();
  const { playSuccess, playError, playWarning } = useSound();
  const [inputValue, setInputValue] = useState('');
  const [lastScan, setLastScan] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const inputRef = useRef(null);
  const prevScansLengthRef = useRef(0);
  const { isMobile, isDesktop } = useScreenSize();

  // Hook para scanner de cámara (solo se activa en modo cámara)
  const handleCameraScan = useCallback((dni) => {
    scanAttendance(dni);
  }, [scanAttendance]);

  const {
    isScanning,
    error: cameraError,
    startScanning,
    stopScanning,
  } = useBarcodeScanner(handleCameraScan);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Detener cámara si cambia a desktop o se desmonta
  useEffect(() => {
    if (isDesktop && isScanning) {
      stopScanning();
      setCameraMode(false);
    }
  }, [isDesktop, isScanning, stopScanning]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScanning();
      }
    };
  }, [isScanning, stopScanning]);

  // Iniciar cámara cuando se activa el modo cámara (después de que el DOM se actualice)
  useEffect(() => {
    if (cameraMode && !isScanning) {
      // Pequeño delay para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        startScanning();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [cameraMode, isScanning, startScanning]);

  useEffect(() => {
    if (recentScans.length > 0 && recentScans.length > prevScansLengthRef.current) {
      const newScan = recentScans[0];
      setLastScan(newScan);

      if (newScan.status === 'present') {
        playSuccess();
        setScanResult('success');
      } else if (newScan.status === 'late') {
        playWarning();
        setScanResult('warning');
      } else {
        playError();
        setScanResult('error');
      }

      if (isMobile) {
        setShowMobileModal(true);
        setTimeout(() => setShowMobileModal(false), 3000);
      }

      setTimeout(() => setScanResult(null), 800);
    }
    prevScansLengthRef.current = recentScans.length;
  }, [recentScans, isMobile, playSuccess, playError, playWarning]);

  const handleScan = useCallback((e) => {
    e.preventDefault();
    const dni = inputValue.trim();
    if (dni.length === 8 && /^\d+$/.test(dni)) {
      scanAttendance(dni);
      setInputValue('');
    } else if (dni.length > 0) {
      playError();
    }
  }, [inputValue, scanAttendance, playError]);

  const handleBlur = () => {
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'present':
        return { color: '#059669', bg: '#ecfdf5', label: 'PRESENTE', icon: '✓' };
      case 'late':
        return { color: '#d97706', bg: '#fffbeb', label: 'TARDANZA', icon: '⏱' };
      default:
        return { color: '#dc2626', bg: '#fef2f2', label: 'FALTA', icon: '✗' };
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ==================== DESKTOP ====================
  if (isDesktop) {
    return (
      <div style={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* Panel Izquierdo - Scanner + Historial */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e5e5e5',
        }}>
          {/* Scanner Area */}
          <motion.div
            style={{
              flex: '0 0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              borderBottom: '1px solid #e5e5e5',
            }}
            animate={scanResult ? {
              backgroundColor: scanResult === 'success' ? '#f0fdf4' :
                              scanResult === 'warning' ? '#fffbeb' : '#fef2f2'
            } : { backgroundColor: '#ffffff' }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats inline */}
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: '#666',
            }}>
              <span><strong style={{ color: '#3b82f6' }}>{stats.total || 0}</strong> Total</span>
              <span><strong style={{ color: '#059669' }}>{stats.present || 0}</strong> Presentes</span>
              <span><strong style={{ color: '#d97706' }}>{stats.late || 0}</strong> Tardanzas</span>
              <span><strong style={{ color: '#dc2626' }}>{stats.absent || 0}</strong> Faltas</span>
            </div>

            {/* Input */}
            <form onSubmit={handleScan} style={{ width: '100%', maxWidth: '450px' }}>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                placeholder="Escanear DNI..."
                maxLength={8}
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  fontSize: '2rem',
                  fontWeight: '600',
                  border: '2px solid #e5e5e5',
                  borderRadius: '1rem',
                  textAlign: 'center',
                  outline: 'none',
                  letterSpacing: '0.1em',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                }}
                onBlurCapture={(e) => {
                  e.target.style.borderColor = '#e5e5e5';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </form>

            {/* Connection status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              fontSize: '0.75rem',
              color: isConnected ? '#059669' : '#dc2626',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnected ? '#059669' : '#dc2626',
              }} />
              {isConnected ? 'Conectado' : 'Sin conexion'}
            </div>
          </motion.div>

          {/* Historial - Ocupa el resto del espacio */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.7rem',
              fontWeight: '600',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderBottom: '1px solid #f0f0f0',
              background: '#fafafa',
            }}>
              Ultimos Registros ({recentScans.length})
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
            }}>
              {recentScans.length === 0 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#ccc',
                  fontSize: '0.9rem',
                }}>
                  Sin registros aun
                </div>
              ) : (
                recentScans.map((scan, index) => {
                  const config = getStatusConfig(scan.status);
                  return (
                    <div
                      key={`${scan.dni}-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem 1.5rem',
                        borderBottom: '1px solid #f5f5f5',
                        background: index === 0 ? config.bg : 'white',
                      }}
                    >
                      {scan.photo ? (
                        <img
                          src={getPhotoUrl(scan.photo)}
                          alt=""
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '0.5rem',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '0.5rem',
                          background: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ccc',
                          fontSize: '1.25rem',
                        }}>👤</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          color: '#333',
                        }}>{scan.student_name}</div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#999',
                        }}>{scan.grade}° - {scan.section}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#999',
                          marginBottom: '0.25rem',
                        }}>{formatTime(scan.scan_timestamp)}</div>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '1rem',
                          background: config.bg,
                          color: config.color,
                        }}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Panel Derecho - Verificacion */}
        <div style={{
          width: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#fafafa',
        }}>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: '600',
            color: '#999',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '2rem',
          }}>
            Verificacion
          </div>

          <AnimatePresence mode="wait">
            {lastScan ? (
              <motion.div
                key={lastScan.dni + lastScan.scan_timestamp}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  textAlign: 'center',
                  background: 'white',
                  borderRadius: '1.5rem',
                  padding: '2rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: `3px solid ${getStatusConfig(lastScan.status).color}`,
                  width: '100%',
                  maxWidth: '300px',
                }}
              >
                {lastScan.photo ? (
                  <img
                    src={getPhotoUrl(lastScan.photo)}
                    alt={lastScan.student_name}
                    style={{
                      width: '140px',
                      height: '175px',
                      borderRadius: '1rem',
                      objectFit: 'cover',
                      marginBottom: '1.25rem',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '140px',
                    height: '175px',
                    borderRadius: '1rem',
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    color: '#ddd',
                    margin: '0 auto 1.25rem',
                  }}>👤</div>
                )}

                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '0.25rem',
                }}>{lastScan.student_name}</div>

                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '1.25rem',
                }}>{lastScan.grade}° - Seccion {lastScan.section}</div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '2rem',
                    fontSize: '1rem',
                    fontWeight: '700',
                    background: getStatusConfig(lastScan.status).bg,
                    color: getStatusConfig(lastScan.status).color,
                  }}
                >
                  <span>{getStatusConfig(lastScan.status).icon}</span>
                  {getStatusConfig(lastScan.status).label}
                </motion.div>

                <div style={{
                  marginTop: '1rem',
                  fontSize: '0.85rem',
                  color: '#999',
                }}>{formatTime(lastScan.scan_timestamp)}</div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center',
                  color: '#ccc',
                }}
              >
                <div style={{ fontSize: '5rem', marginBottom: '1rem', opacity: 0.5 }}>👤</div>
                <div style={{ fontSize: '1rem' }}>Esperando escaneo...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ==================== MOBILE ====================
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        background: '#fafafa',
        borderBottom: '1px solid #eee',
        flexWrap: 'wrap',
      }}>
        {[
          { label: 'Total', value: stats.total || 0, color: '#3b82f6' },
          { label: 'Presentes', value: stats.present || 0, color: '#059669' },
          { label: 'Tardanzas', value: stats.late || 0, color: '#d97706' },
        ].map((stat) => (
          <div key={stat.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            background: 'white',
            borderRadius: '2rem',
            fontSize: '0.75rem',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: stat.color,
            }} />
            <strong>{stat.value}</strong> {stat.label}
          </div>
        ))}
      </div>

      {/* Scanner - Modo Cámara o Input */}
      <motion.div
        style={{
          padding: cameraMode ? '1rem' : '2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        animate={scanResult ? {
          backgroundColor: scanResult === 'success' ? '#f0fdf4' :
                          scanResult === 'warning' ? '#fffbeb' : '#fef2f2'
        } : { backgroundColor: '#ffffff' }}
        transition={{ duration: 0.3 }}
      >
        {/* Toggle Cámara/Manual */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          background: '#f1f5f9',
          padding: '0.25rem',
          borderRadius: '0.75rem',
        }}>
          <button
            onClick={() => {
              setCameraMode(false);
              if (isScanning) stopScanning();
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: !cameraMode ? '#1e40af' : 'transparent',
              color: !cameraMode ? 'white' : '#64748b',
              transition: 'all 0.2s',
            }}
          >
            Teclado
          </button>
          <button
            onClick={() => setCameraMode(true)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: cameraMode ? '#1e40af' : 'transparent',
              color: cameraMode ? 'white' : '#64748b',
              transition: 'all 0.2s',
            }}
          >
            Camara
          </button>
        </div>

        {cameraMode ? (
          /* Modo Cámara */
          <div style={{ width: '100%', maxWidth: '400px' }}>
            {/* Contenedor del video de la cámara */}
            <div
              id="barcode-scanner"
              style={{
                width: '100%',
                minHeight: '250px',
                borderRadius: '1rem',
                overflow: 'hidden',
                background: '#000',
                position: 'relative',
              }}
            />

            {/* Error de cámara */}
            {cameraError && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.75rem',
                color: '#dc2626',
                fontSize: '0.8rem',
                textAlign: 'center',
              }}>
                {cameraError}
              </div>
            )}

            {/* Instrucciones */}
            {isScanning && !cameraError && (
              <div style={{
                marginTop: '1rem',
                textAlign: 'center',
                fontSize: '0.8rem',
                color: '#64748b',
              }}>
                Apunta al codigo de barras del carnet
              </div>
            )}

            {/* Botón reiniciar cámara */}
            {!isScanning && !cameraError && (
              <button
                onClick={startScanning}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.75rem',
                  background: '#1e40af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Iniciar Camara
              </button>
            )}
          </div>
        ) : (
          /* Modo Input Manual */
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>⌨️</div>

            <form onSubmit={handleScan} style={{ width: '100%', maxWidth: '320px' }}>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                placeholder="DNI"
                maxLength={8}
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  border: '2px solid #e5e5e5',
                  borderRadius: '1rem',
                  textAlign: 'center',
                  outline: 'none',
                  letterSpacing: '0.1em',
                }}
              />
            </form>
          </>
        )}

        {/* Estado de conexión */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginTop: '1rem',
          fontSize: '0.7rem',
          color: isConnected ? '#059669' : '#dc2626',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isConnected ? '#059669' : '#dc2626',
          }} />
          {isConnected ? 'Conectado' : 'Sin conexion'}
        </div>
      </motion.div>

      {/* Historial Mobile */}
      <div style={{ flex: 1, background: 'white' }}>
        <div style={{
          padding: '0.6rem 1rem',
          fontSize: '0.65rem',
          fontWeight: '600',
          color: '#999',
          textTransform: 'uppercase',
          background: '#fafafa',
          borderTop: '1px solid #eee',
          borderBottom: '1px solid #eee',
        }}>
          Ultimos registros
        </div>

        {recentScans.slice(0, 6).map((scan, index) => {
          const config = getStatusConfig(scan.status);
          return (
            <div
              key={`${scan.dni}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 1rem',
                borderBottom: '1px solid #f5f5f5',
              }}
            >
              {scan.photo ? (
                <img
                  src={getPhotoUrl(scan.photo)}
                  alt=""
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '0.5rem',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '0.5rem',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ccc',
                }}>👤</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: '500',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>{scan.student_name}</div>
                <div style={{ fontSize: '0.7rem', color: '#999' }}>
                  {scan.grade}° - {scan.section}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: '#999' }}>
                  {formatTime(scan.scan_timestamp)}
                </div>
                <span style={{
                  fontSize: '0.55rem',
                  fontWeight: '600',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '1rem',
                  background: config.bg,
                  color: config.color,
                }}>
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Modal */}
      <AnimatePresence>
        {showMobileModal && lastScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1.5rem',
                padding: '1.5rem',
                width: '100%',
                maxWidth: '280px',
                textAlign: 'center',
                border: `3px solid ${getStatusConfig(lastScan.status).color}`,
              }}
            >
              {lastScan.photo ? (
                <img
                  src={getPhotoUrl(lastScan.photo)}
                  alt=""
                  style={{
                    width: '100px',
                    height: '125px',
                    borderRadius: '0.75rem',
                    objectFit: 'cover',
                    marginBottom: '1rem',
                  }}
                />
              ) : (
                <div style={{
                  width: '100px',
                  height: '125px',
                  borderRadius: '0.75rem',
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  color: '#ddd',
                  margin: '0 auto 1rem',
                }}>👤</div>
              )}

              <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>
                {lastScan.student_name}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                {lastScan.grade}° - {lastScan.section}
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                fontWeight: '700',
                fontSize: '0.85rem',
                background: getStatusConfig(lastScan.status).bg,
                color: getStatusConfig(lastScan.status).color,
              }}>
                <span>{getStatusConfig(lastScan.status).icon}</span>
                {getStatusConfig(lastScan.status).label}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
