import React, { useState, useRef, useEffect } from 'react';
import Barcode from 'react-barcode';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getPhotoUrl } from '../../utils/photoUrl';
import { configAPI } from '../../api/endpoints';

// Dimensiones DNI Peruano (85.4mm x 54mm)
const CARD_WIDTH = 339;
const CARD_HEIGHT = 215;

export default function BulkCarnetDownload({ students, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentStudent: '' });
  const [institutionName, setInstitutionName] = useState('');
  const frontRef = useRef();
  const backRef = useRef();
  const [currentStudent, setCurrentStudent] = useState(null);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await configAPI.get();
        setInstitutionName(response.data.institution_name || 'IES');
      } catch (error) {
        setInstitutionName('IES');
      }
    };
    loadConfig();
  }, []);

  // Agrupar estudiantes por grado y seccion
  const groupStudentsByGrade = () => {
    const grouped = {};
    students.forEach((student) => {
      const grade = student.grade; // "1ro", "2do", etc.
      const section = student.section; // "A", "B", etc.
      const key = `${grade}/${grade}_${section}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(student);
    });
    return grouped;
  };

  // Convertir elemento a blob PNG
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

  // Obtener nombre de carpeta para estudiante
  const getFolderName = (student) => {
    const apellidos = `${student.paternal_surname}_${student.maternal_surname}`;
    const nombre = student.first_name.replace(/\s+/g, '_');
    return `${apellidos}_${nombre}_${student.dni}`;
  };

  // Esperar a que la imagen cargue
  const waitForImage = (student) => {
    return new Promise((resolve) => {
      if (!student.photo) {
        resolve();
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = getPhotoUrl(student.photo);
      // Timeout de 3 segundos por imagen
      setTimeout(resolve, 3000);
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    const zip = new JSZip();
    const grouped = groupStudentsByGrade();
    const totalStudents = students.length;
    let processed = 0;

    try {
      for (const student of students) {
        // Actualizar progreso
        processed++;
        setProgress({
          current: processed,
          total: totalStudents,
          currentStudent: `${student.first_name} ${student.paternal_surname}`,
        });

        // Renderizar el estudiante actual
        setCurrentStudent(student);

        // Esperar a que React renderice y la imagen cargue
        await new Promise((resolve) => setTimeout(resolve, 100));
        await waitForImage(student);
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Capturar anverso y reverso
        const [frontBlob, backBlob] = await Promise.all([
          elementToBlob(frontRef.current),
          elementToBlob(backRef.current),
        ]);

        // Crear ruta de carpeta
        const grade = student.grade;
        const section = student.section;
        const studentFolder = getFolderName(student);
        const path = `${grade}/${grade}_${section}/${studentFolder}`;

        // Agregar al ZIP
        zip.file(`${path}/anverso.png`, frontBlob);
        zip.file(`${path}/reverso.png`, backBlob);
      }

      // Generar y descargar ZIP
      setProgress((prev) => ({ ...prev, currentStudent: 'Generando archivo ZIP...' }));
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      const fecha = new Date().toISOString().split('T')[0];
      saveAs(zipBlob, `carnets_estudiantes_${fecha}.zip`);

      onClose();
    } catch (error) {
      console.error('Error generando carnets:', error);
      alert('Error al generar los carnets. Por favor intenta de nuevo.');
    } finally {
      setDownloading(false);
      setCurrentStudent(null);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
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
      maxWidth: '500px',
      width: '100%',
      textAlign: 'center',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: 'white',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: '0.9rem',
      color: 'rgba(255,255,255,0.7)',
      marginBottom: '2rem',
    },
    info: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '1.5rem',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      color: 'white',
      fontSize: '0.9rem',
      marginBottom: '0.5rem',
    },
    progressContainer: {
      marginBottom: '1.5rem',
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '0.75rem',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#22c55e',
      transition: 'width 0.3s ease',
    },
    progressText: {
      fontSize: '0.85rem',
      color: 'rgba(255,255,255,0.8)',
    },
    currentStudent: {
      fontSize: '0.8rem',
      color: '#22c55e',
      marginTop: '0.5rem',
    },
    actions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
    },
    btn: {
      padding: '0.875rem 2rem',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s',
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(5,150,105,0.4)',
    },
    btnSecondary: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.2)',
    },
    btnDisabled: {
      backgroundColor: '#4b5563',
      color: 'rgba(255,255,255,0.5)',
      cursor: 'not-allowed',
    },
    // Estilos del carnet (oculto para renderizado)
    hiddenContainer: {
      position: 'fixed',
      left: '-9999px',
      top: 0,
    },
    cardFront: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      background: '#ffffff',
      borderRadius: '14px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      border: '2px solid #1e3a5f',
    },
    cardBack: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      background: '#ffffff',
      borderRadius: '14px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      border: '2px solid #1e3a5f',
    },
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
    frontBody: {
      display: 'flex',
      padding: '12px 14px',
      gap: '14px',
    },
    photoContainer: {
      width: '82px',
      height: '100px',
      backgroundColor: 'white',
      borderRadius: '6px',
      overflow: 'hidden',
      flexShrink: 0,
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
      backgroundColor: '#e8e8e8',
      color: '#999',
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
    infoRowCard: {
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
      color: '#64748b',
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
    watermark: {
      display: 'none',
    },
    backHeader: {
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
      padding: '12px 14px 8px',
      borderBottom: '1px solid rgba(0,0,0,0.1)',
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
      opacity: 0.7,
    },
    backTitle: {
      fontSize: '9px',
      fontWeight: 700,
      color: '#1e3a5f',
      letterSpacing: '1px',
      margin: 0,
    },
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
      color: '#1e3a5f',
      marginTop: '8px',
      letterSpacing: '2px',
    },
    backFooter: {
      position: 'relative',
      zIndex: 1,
      padding: '8px 14px 12px',
      borderTop: '1px solid rgba(0,0,0,0.1)',
      background: 'linear-gradient(180deg, transparent 0%, rgba(30,58,95,0.05) 100%)',
    },
    footerText: {
      fontSize: '7px',
      color: '#666',
      textAlign: 'center',
      margin: 0,
      lineHeight: 1.4,
    },
    footerStrong: {
      fontWeight: 700,
      color: '#1e3a5f',
    },
  };

  const renderCarnet = (student) => {
    if (!student) return null;

    const fullName = `${student.paternal_surname} ${student.maternal_surname}, ${student.first_name}`;
    const gradeText = `${student.grade} Secundaria`;

    return (
      <div style={styles.hiddenContainer}>
        {/* ANVERSO */}
        <div ref={frontRef} style={styles.cardFront}>
          <div style={styles.frontHeader}>
            <img src="/images/escudo.png" alt="" style={styles.headerEmblem} />
            <div style={styles.headerCenter}>
              <p style={styles.institutionName}>{institutionName.toUpperCase()}</p>
              <p style={styles.institutionSubtitle}>Carnet Estudiantil</p>
            </div>
            <img src="/images/logo.png" alt="" style={styles.headerEmblem} />
          </div>
          <div style={styles.frontBody}>
            <div style={styles.photoContainer}>
              {student.photo ? (
                <img
                  src={getPhotoUrl(student.photo)}
                  alt={fullName}
                  style={styles.photo}
                  crossOrigin="anonymous"
                />
              ) : (
                <div style={styles.photoPlaceholder}>👤</div>
              )}
            </div>
            <div style={styles.studentInfo}>
              <div style={styles.studentName}>{fullName}</div>
              <div style={styles.infoRowCard}>
                <span style={styles.infoLabel}>DNI</span>
                <span style={styles.infoValue}>{student.dni}</span>
              </div>
              <div style={styles.infoRowCard}>
                <span style={styles.infoLabel}>GRADO</span>
                <span style={styles.infoValue}>{gradeText}</span>
              </div>
              <div style={styles.infoRowCard}>
                <span style={styles.infoLabel}>SECCION</span>
                <span style={styles.infoValue}>{student.section}</span>
              </div>
            </div>
          </div>
          <div style={styles.frontFooter}>
            <span style={styles.yearBadge}>Año Lectivo {currentYear}</span>
            <span style={styles.cardTypeBadge}>Estudiante</span>
          </div>
        </div>

        {/* REVERSO */}
        <div ref={backRef} style={styles.cardBack}>
          <img src="/images/escudo.png" alt="" style={styles.watermark} />
          <div style={styles.backHeader}>
            <div style={styles.backHeaderRow}>
              <img src="/images/logo.png" alt="" style={styles.backEmblemSmall} />
              <p style={styles.backTitle}>SISTEMA DE CONTROL DE ASISTENCIA</p>
              <img src="/images/escudo.png" alt="" style={styles.backEmblemSmall} />
            </div>
          </div>
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
    );
  };

  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div style={styles.overlay} onClick={!downloading ? onClose : undefined}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Descargar Todos los Carnets</h2>
        <p style={styles.subtitle}>
          Se generaran los carnets organizados por grado y seccion
        </p>

        <div style={styles.info}>
          <div style={styles.infoRow}>
            <span>Total de estudiantes:</span>
            <span><strong>{students.length}</strong></span>
          </div>
          <div style={styles.infoRow}>
            <span>Archivos a generar:</span>
            <span><strong>{students.length * 2}</strong> (anverso + reverso)</span>
          </div>
        </div>

        {downloading && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progressPercent}%`
                }}
              />
            </div>
            <div style={styles.progressText}>
              Procesando {progress.current} de {progress.total} estudiantes...
            </div>
            <div style={styles.currentStudent}>
              {progress.currentStudent}
            </div>
          </div>
        )}

        <div style={styles.actions}>
          {!downloading && (
            <button
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={onClose}
            >
              Cancelar
            </button>
          )}
          <button
            style={{
              ...styles.btn,
              ...(downloading ? styles.btnDisabled : styles.btnPrimary)
            }}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? 'Generando...' : 'Iniciar Descarga'}
          </button>
        </div>
      </div>

      {/* Carnets ocultos para renderizado */}
      {renderCarnet(currentStudent)}
    </div>
  );
}
