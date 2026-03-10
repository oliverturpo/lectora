import React, { useRef, useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getPhotoUrl } from '../../utils/photoUrl';
import { configAPI } from '../../api/endpoints';

// Dimensiones DNI Peruano (85.4mm x 54mm) - escalado para pantalla
const CARD_WIDTH = 339;
const CARD_HEIGHT = 215;

export default function StudentIDCard({ student, onClose }) {
  const frontRef = useRef();
  const backRef = useRef();
  const [downloading, setDownloading] = useState(false);
  const [institutionName, setInstitutionName] = useState('');

  const fullName = `${student.paternal_surname} ${student.maternal_surname}, ${student.first_name}`;
  const gradeText = `${student.grade} Secundaria`;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await configAPI.get();
        setInstitutionName(response.data.institution_name || 'IES');
      } catch (error) {
        console.error('Error cargando configuración:', error);
        setInstitutionName('IES');
      }
    };
    loadConfig();
  }, []);

  // Funcion para convertir elemento a blob PNG
  const elementToBlob = async (element) => {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const getFolderName = () => {
    const apellidos = `${student.paternal_surname}_${student.maternal_surname}`;
    const nombre = student.first_name.replace(/\s+/g, '_');
    return `${apellidos}_${nombre}_${student.dni}`;
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folderName = getFolderName();
      const folder = zip.folder(folderName);

      const [frontBlob, backBlob] = await Promise.all([
        elementToBlob(frontRef.current),
        elementToBlob(backRef.current),
      ]);

      folder.file('anverso.png', frontBlob);
      folder.file('reverso.png', backBlob);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${folderName}.zip`);
    } catch (error) {
      console.error('Error al generar ZIP:', error);
      alert('Error al generar el archivo ZIP');
    }
    setDownloading(false);
  };

  // ==================== ESTILOS ====================
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    },
    modal: {
      backgroundColor: '#1a1a2e',
      borderRadius: '1.5rem',
      padding: '2rem',
      maxWidth: '850px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    titleIcon: {
      width: '32px',
      height: '32px',
      backgroundColor: '#c41e3a',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtn: {
      padding: '0.625rem 1.25rem',
      backgroundColor: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      color: 'white',
      transition: 'all 200ms',
    },
    cardsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2.5rem',
      justifyContent: 'center',
      marginBottom: '2rem',
    },
    cardWrapper: {
      textAlign: 'center',
    },
    cardLabel: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: 'rgba(255,255,255,0.6)',
      marginBottom: '0.75rem',
      letterSpacing: '2px',
    },

    // ========== ANVERSO (Optimizado para impresión) ==========
    cardFront: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      background: '#ffffff',
      borderRadius: '14px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      border: '2px solid #1e3a5f',
    },
    // Header con escudos
    frontHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px 8px 14px',
      borderBottom: '2px solid #1e3a5f',
      background: '#f8fafc',
    },
    headerEmblem: {
      width: '38px',
      height: '38px',
      objectFit: 'contain',
    },
    headerEmblemPlaceholder: {
      width: '38px',
      height: '38px',
      backgroundColor: '#e2e8f0',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      color: '#64748b',
    },
    headerCenter: {
      textAlign: 'center',
      flex: 1,
      padding: '0 8px',
    },
    institutionName: {
      fontSize: '11px',
      fontWeight: 800,
      color: '#1e3a5f',
      letterSpacing: '1px',
      margin: 0,
    },
    institutionSubtitle: {
      fontSize: '7px',
      color: '#c41e3a',
      fontWeight: 700,
      letterSpacing: '2px',
      margin: '3px 0 0 0',
      textTransform: 'uppercase',
    },
    // Cuerpo del carnet
    frontBody: {
      display: 'flex',
      padding: '12px 14px',
      gap: '14px',
    },
    photoContainer: {
      width: '82px',
      height: '100px',
      backgroundColor: '#f1f5f9',
      borderRadius: '6px',
      overflow: 'hidden',
      flexShrink: 0,
      border: '2px solid #1e3a5f',
    },
    photo: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    photoPlaceholder: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#e2e8f0',
      color: '#64748b',
      fontSize: '2.5rem',
    },
    studentInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    studentName: {
      fontSize: '13px',
      fontWeight: 700,
      color: '#1e293b',
      marginBottom: '10px',
      lineHeight: 1.3,
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '5px',
    },
    infoLabel: {
      fontSize: '8px',
      color: '#64748b',
      width: '45px',
      fontWeight: 600,
    },
    infoValue: {
      fontSize: '10px',
      color: '#1e293b',
      fontWeight: 600,
    },
    // Footer del anverso
    frontFooter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 14px',
      borderTop: '1px solid #e2e8f0',
      background: '#f8fafc',
    },
    yearBadge: {
      fontSize: '9px',
      color: '#1e3a5f',
      fontWeight: 600,
    },
    cardTypeBadge: {
      fontSize: '7px',
      backgroundColor: '#c41e3a',
      color: 'white',
      padding: '3px 10px',
      borderRadius: '10px',
      fontWeight: 700,
      letterSpacing: '1px',
      textTransform: 'uppercase',
    },

    // ========== REVERSO (Fondo blanco para impresión) ==========
    cardBack: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      background: '#ffffff',
      borderRadius: '14px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      border: '2px solid #1e3a5f',
    },
    // Marca de agua eliminada para mejor impresión
    watermark: {
      display: 'none',
    },
    watermarkPlaceholder: {
      display: 'none',
    },
    // Header del reverso
    backHeader: {
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
      padding: '12px 14px 8px',
      borderBottom: '2px solid #1e3a5f',
    },
    backHeaderRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
    },
    backEmblemSmall: {
      width: '24px',
      height: '24px',
      objectFit: 'contain',
    },
    backTitle: {
      fontSize: '9px',
      fontWeight: 700,
      color: '#1e3a5f',
      letterSpacing: '1px',
      margin: 0,
    },
    // Codigo de barras
    barcodeSection: {
      position: 'relative',
      zIndex: 1,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 20px',
    },
    barcodeWrapper: {
      padding: '8px 16px',
    },
    dniNumber: {
      fontSize: '14px',
      fontWeight: 800,
      color: '#1e293b',
      marginTop: '8px',
      letterSpacing: '2px',
    },
    // Footer del reverso
    backFooter: {
      position: 'relative',
      zIndex: 1,
      padding: '8px 14px 12px',
      borderTop: '1px solid #e2e8f0',
    },
    footerRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      marginBottom: '4px',
    },
    footerIcon: {
      fontSize: '10px',
    },
    footerText: {
      fontSize: '7px',
      color: '#374151',
      textAlign: 'center',
      margin: 0,
      lineHeight: 1.4,
    },
    footerStrong: {
      fontWeight: 700,
      color: '#1e293b',
    },

    // ========== ACCIONES ==========
    actions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
    },
    downloadBtn: {
      padding: '1rem 2.5rem',
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      boxShadow: '0 4px 15px rgba(5,150,105,0.4)',
      transition: 'all 200ms',
    },
    downloadBtnDisabled: {
      padding: '1rem 2.5rem',
      backgroundColor: '#4b5563',
      color: 'rgba(255,255,255,0.6)',
      border: 'none',
      borderRadius: '0.75rem',
      cursor: 'not-allowed',
      fontSize: '1rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div style={styles.header}>
          <div style={styles.title}>
            <div style={styles.titleIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2"/>
                <circle cx="9" cy="10" r="2"/>
                <path d="M15 8h2M15 12h2M7 16h10"/>
              </svg>
            </div>
            Carnet de Estudiante
          </div>
          <button
            style={styles.closeBtn}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          >
            Cerrar
          </button>
        </div>

        {/* Contenedor de carnets */}
        <div style={styles.cardsContainer}>
          {/* ==================== ANVERSO ==================== */}
          <div style={styles.cardWrapper}>
            <div style={styles.cardLabel}>ANVERSO</div>
            <div ref={frontRef} style={styles.cardFront}>
              {/* Header con escudos */}
              <div style={styles.frontHeader}>
                {/* Escudo Nacional del Peru - Izquierda */}
                <img
                  src="/images/escudo.png"
                  alt="Escudo del Peru"
                  style={styles.headerEmblem}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                  }}
                />
                <div style={{...styles.headerEmblemPlaceholder, display: 'none'}}>
                  Escudo
                </div>

                {/* Texto central */}
                <div style={styles.headerCenter}>
                  <p style={styles.institutionName}>{institutionName.toUpperCase()}</p>
                  <p style={styles.institutionSubtitle}>Carnet Estudiantil</p>
                </div>

                {/* Logo del colegio - Derecha */}
                <img
                  src="/images/logo.png"
                  alt="Logo IES"
                  style={styles.headerEmblem}
                  onError={(e) => {
                    e.target.src = '/images/logo.jpg';
                    e.target.onerror = () => {
                      e.target.style.display = 'none';
                    };
                  }}
                />
              </div>

              {/* Cuerpo */}
              <div style={styles.frontBody}>
                <div style={styles.photoContainer}>
                  {student.photo ? (
                    <img src={getPhotoUrl(student.photo)} alt={fullName} style={styles.photo} />
                  ) : (
                    <div style={styles.photoPlaceholder}>👤</div>
                  )}
                </div>
                <div style={styles.studentInfo}>
                  <div style={styles.studentName}>{fullName}</div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>DNI</span>
                    <span style={styles.infoValue}>{student.dni}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>GRADO</span>
                    <span style={styles.infoValue}>{gradeText}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>SECCION</span>
                    <span style={styles.infoValue}>{student.section}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={styles.frontFooter}>
                <span style={styles.yearBadge}>Año Lectivo {currentYear}</span>
                <span style={styles.cardTypeBadge}>Estudiante</span>
              </div>
            </div>
          </div>

          {/* ==================== REVERSO ==================== */}
          <div style={styles.cardWrapper}>
            <div style={styles.cardLabel}>REVERSO</div>
            <div ref={backRef} style={styles.cardBack}>
              {/* Marca de agua - Escudo Nacional */}
              <img
                src="/images/escudo.png"
                alt=""
                style={styles.watermark}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              {/* Header */}
              <div style={styles.backHeader}>
                <div style={styles.backHeaderRow}>
                  <img
                    src="/images/logo.png"
                    alt=""
                    style={styles.backEmblemSmall}
                    onError={(e) => {
                      e.target.src = '/images/logo.jpg';
                      e.target.onerror = () => e.target.style.display = 'none';
                    }}
                  />
                  <p style={styles.backTitle}>SISTEMA DE CONTROL DE ASISTENCIA</p>
                  <img
                    src="/images/escudo.png"
                    alt=""
                    style={styles.backEmblemSmall}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              </div>

              {/* Codigo de barras */}
              <div style={styles.barcodeSection}>
                <div style={styles.barcodeWrapper}>
                  <Barcode
                    value={student.dni}
                    width={2.2}
                    height={50}
                    fontSize={12}
                    margin={0}
                    displayValue={false}
                    background="transparent"
                  />
                </div>
                <div style={styles.dniNumber}>DNI: {student.dni}</div>
              </div>

              {/* Footer */}
              <div style={styles.backFooter}>
                <p style={styles.footerText}>
                  <span style={styles.footerStrong}>Este carnet es personal e intransferible</span>
                </p>
                <p style={styles.footerText}>
                  En caso de perdida comunicarse con la direccion de la I.E.S.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Boton de descarga */}
        <div style={styles.actions}>
          <button
            style={downloading ? styles.downloadBtnDisabled : styles.downloadBtn}
            onClick={handleDownloadZip}
            disabled={downloading}
            onMouseEnter={(e) => {
              if (!downloading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(5,150,105,0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(5,150,105,0.4)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {downloading ? 'Generando ZIP...' : 'Descargar Carnet (ZIP)'}
          </button>
        </div>
      </div>
    </div>
  );
}
