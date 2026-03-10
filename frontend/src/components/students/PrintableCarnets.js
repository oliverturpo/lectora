import React, { useState, useRef, useEffect } from 'react';
import Barcode from 'react-barcode';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { getPhotoUrl } from '../../utils/photoUrl';
import { configAPI } from '../../api/endpoints';

// Dimensiones en mm (DNI Peruano: 85.4mm x 54mm)
const CARD_WIDTH_MM = 85.4;
const CARD_HEIGHT_MM = 54;

// Dimensiones en píxeles para renderizado (escala 4x para calidad)
const SCALE = 4;
const CARD_WIDTH_PX = Math.round(CARD_WIDTH_MM * SCALE);
const CARD_HEIGHT_PX = Math.round(CARD_HEIGHT_MM * SCALE);

// Diseño A4 (210mm x 297mm)
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// Distribución: 2 columnas x 2 filas = 4 estudiantes por página
// Cada estudiante ocupa: 85.4mm x 108mm (anverso + reverso)
const MARGIN_LEFT_MM = 13;
const MARGIN_TOP_MM = 20;
const GAP_X_MM = 13;  // Entre columnas
const GAP_Y_MM = 25;  // Entre filas

export default function PrintableCarnets({ students, onClose }) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
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

  // Agrupar estudiantes por grado
  const groupByGrade = (studentsList) => {
    const grades = ['1ro', '2do', '3ro', '4to', '5to'];
    const grouped = {};
    grades.forEach(g => { grouped[g] = []; });

    studentsList.forEach(student => {
      if (grouped[student.grade]) {
        grouped[student.grade].push(student);
      }
    });

    // Ordenar cada grado por sección y apellido
    Object.keys(grouped).forEach(grade => {
      grouped[grade].sort((a, b) => {
        if (a.section !== b.section) return a.section.localeCompare(b.section);
        return a.paternal_surname.localeCompare(b.paternal_surname);
      });
    });

    return grouped;
  };

  // Esperar carga de imagen
  const waitForImage = (student) => {
    return new Promise((resolve) => {
      if (!student.photo) {
        resolve();
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setTimeout(resolve, 100);
      img.onerror = () => resolve();
      img.src = getPhotoUrl(student.photo);
      setTimeout(resolve, 2000);
    });
  };

  // Convertir elemento a imagen base64
  const elementToDataURL = async (element, rotate = false) => {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
    });

    if (rotate) {
      // Rotar 180 grados para el reverso
      const rotatedCanvas = document.createElement('canvas');
      rotatedCanvas.width = canvas.width;
      rotatedCanvas.height = canvas.height;
      const ctx = rotatedCanvas.getContext('2d');
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
      return rotatedCanvas.toDataURL('image/png');
    }

    return canvas.toDataURL('image/png');
  };

  // Generar carnets de un estudiante
  const generateStudentCarnets = async (student) => {
    setCurrentStudent(student);
    await new Promise(r => setTimeout(r, 50));
    await waitForImage(student);
    await new Promise(r => setTimeout(r, 150));

    const frontDataUrl = await elementToDataURL(frontRef.current, false);
    const backDataUrl = await elementToDataURL(backRef.current, true); // Rotado 180°

    return { front: frontDataUrl, back: backDataUrl, student };
  };

  // Dibujar líneas de corte y doblez
  const drawCutLines = (pdf, x, y, width, height) => {
    const lineLen = 3; // Longitud de marca de corte en mm
    pdf.setDrawColor(150);
    pdf.setLineWidth(0.2);

    // Esquinas del carnet completo (anverso + reverso)
    const totalHeight = height * 2;

    // Esquina superior izquierda
    pdf.line(x - lineLen, y, x, y);
    pdf.line(x, y - lineLen, x, y);

    // Esquina superior derecha
    pdf.line(x + width, y, x + width + lineLen, y);
    pdf.line(x + width, y - lineLen, x + width, y);

    // Esquina inferior izquierda
    pdf.line(x - lineLen, y + totalHeight, x, y + totalHeight);
    pdf.line(x, y + totalHeight, x, y + totalHeight + lineLen);

    // Esquina inferior derecha
    pdf.line(x + width, y + totalHeight, x + width + lineLen, y + totalHeight);
    pdf.line(x + width, y + totalHeight, x + width, y + totalHeight + lineLen);

    // Línea de doblez (punteada)
    pdf.setLineDashPattern([1, 1], 0);
    pdf.setDrawColor(180);
    pdf.line(x, y + height, x + width, y + height);
    pdf.setLineDashPattern([], 0);
  };

  // Generar PDF
  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const grouped = groupByGrade(students);
      const allStudents = [];

      // Aplanar manteniendo orden por grado
      ['1ro', '2do', '3ro', '4to', '5to'].forEach(grade => {
        allStudents.push(...grouped[grade]);
      });

      const totalStudents = allStudents.length;
      const carnetsData = [];

      // Fase 1: Generar imágenes de todos los carnets
      setProgress({ current: 0, total: totalStudents, phase: 'Generando carnets...' });

      for (let i = 0; i < allStudents.length; i++) {
        setProgress({
          current: i + 1,
          total: totalStudents,
          phase: `Procesando: ${allStudents[i].first_name} ${allStudents[i].paternal_surname}`
        });

        const carnetData = await generateStudentCarnets(allStudents[i]);
        carnetsData.push(carnetData);
      }

      // Fase 2: Crear PDF
      setProgress({ current: 0, total: 0, phase: 'Creando PDF...' });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const studentsPerPage = 4;
      const totalPages = Math.ceil(carnetsData.length / studentsPerPage);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        const startIdx = page * studentsPerPage;
        const pageStudents = carnetsData.slice(startIdx, startIdx + studentsPerPage);

        // Posiciones en la página (2 columnas x 2 filas)
        const positions = [
          { col: 0, row: 0 }, // Arriba izquierda
          { col: 1, row: 0 }, // Arriba derecha
          { col: 0, row: 1 }, // Abajo izquierda
          { col: 1, row: 1 }, // Abajo derecha
        ];

        for (let i = 0; i < pageStudents.length; i++) {
          const { front, back, student } = pageStudents[i];
          const pos = positions[i];

          // Calcular posición X e Y
          const x = MARGIN_LEFT_MM + pos.col * (CARD_WIDTH_MM + GAP_X_MM);
          const y = MARGIN_TOP_MM + pos.row * (CARD_HEIGHT_MM * 2 + GAP_Y_MM);

          // Dibujar líneas de corte y doblez
          drawCutLines(pdf, x, y, CARD_WIDTH_MM, CARD_HEIGHT_MM);

          // Agregar anverso
          pdf.addImage(front, 'PNG', x, y, CARD_WIDTH_MM, CARD_HEIGHT_MM);

          // Agregar reverso (ya rotado 180° en la imagen)
          const backY = y + CARD_HEIGHT_MM;
          pdf.addImage(back, 'PNG', x, backY, CARD_WIDTH_MM, CARD_HEIGHT_MM);
        }

        // Número de página y fecha
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(
          `Página ${page + 1} de ${totalPages} - Generado: ${new Date().toLocaleDateString('es-PE')}`,
          A4_WIDTH_MM / 2,
          A4_HEIGHT_MM - 5,
          { align: 'center' }
        );
      }

      // Guardar PDF
      const fecha = new Date().toISOString().split('T')[0];
      pdf.save(`carnets_imprimibles_${fecha}.pdf`);

      setCurrentStudent(null);
      onClose();

    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      setGenerating(false);
    }
  };

  // Estilos del carnet para renderizado
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    },
    modal: {
      backgroundColor: '#1e293b',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '550px',
      width: '100%',
      color: 'white',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 700,
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    subtitle: {
      color: 'rgba(255,255,255,0.7)',
      marginBottom: '1.5rem',
      fontSize: '0.9rem',
    },
    infoBox: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      marginBottom: '1.5rem',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
    },
    infoItem: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    infoLabel: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: '0.85rem',
    },
    infoValue: {
      fontWeight: 600,
      fontSize: '0.85rem',
    },
    instructionsBox: {
      backgroundColor: 'rgba(34,197,94,0.1)',
      border: '1px solid rgba(34,197,94,0.3)',
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '1.5rem',
    },
    instructionsTitle: {
      fontWeight: 600,
      fontSize: '0.9rem',
      marginBottom: '0.5rem',
      color: '#22c55e',
    },
    instructionsList: {
      fontSize: '0.8rem',
      color: 'rgba(255,255,255,0.8)',
      lineHeight: 1.6,
      paddingLeft: '1rem',
      margin: 0,
    },
    progressBox: {
      marginBottom: '1.5rem',
    },
    progressBar: {
      height: '8px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '0.5rem',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#22c55e',
      transition: 'width 0.3s ease',
    },
    progressText: {
      fontSize: '0.8rem',
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
    },
    actions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
    },
    btn: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: 600,
      fontSize: '0.9rem',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s',
    },
    btnPrimary: {
      backgroundColor: '#22c55e',
      color: 'white',
    },
    btnSecondary: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: 'white',
    },
    btnDisabled: {
      backgroundColor: '#4b5563',
      color: 'rgba(255,255,255,0.5)',
      cursor: 'not-allowed',
    },
    // Carnets ocultos
    hiddenArea: {
      position: 'fixed',
      left: '-9999px',
      top: 0,
    },
    cardFront: {
      width: CARD_WIDTH_PX,
      height: CARD_HEIGHT_PX,
      background: '#ffffff',
      borderRadius: SCALE * 3.5,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', sans-serif",
      border: `${SCALE * 0.5}px solid #1e3a5f`,
    },
    cardBack: {
      width: CARD_WIDTH_PX,
      height: CARD_HEIGHT_PX,
      background: '#ffffff',
      borderRadius: SCALE * 3.5,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', sans-serif",
      border: `${SCALE * 0.5}px solid #1e3a5f`,
    },
    frontHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${SCALE * 2.5}px ${SCALE * 3.5}px ${SCALE * 2}px`,
      borderBottom: `${SCALE * 0.5}px solid #1e3a5f`,
      background: '#f8fafc',
    },
    headerEmblem: {
      width: SCALE * 9.5,
      height: SCALE * 9.5,
      objectFit: 'contain',
    },
    headerCenter: {
      textAlign: 'center',
      flex: 1,
      padding: `0 ${SCALE * 2}px`,
    },
    institutionNameStyle: {
      fontSize: SCALE * 2.75,
      fontWeight: 800,
      color: '#1e3a5f',
      letterSpacing: SCALE * 0.25,
      margin: 0,
    },
    institutionSubtitle: {
      fontSize: SCALE * 1.75,
      color: '#c41e3a',
      fontWeight: 700,
      letterSpacing: SCALE * 0.5,
      margin: `${SCALE * 0.75}px 0 0 0`,
      textTransform: 'uppercase',
    },
    frontBody: {
      display: 'flex',
      padding: `${SCALE * 3}px ${SCALE * 3.5}px`,
      gap: SCALE * 3.5,
    },
    photoContainer: {
      width: SCALE * 20.5,
      height: SCALE * 25,
      backgroundColor: '#f1f5f9',
      borderRadius: SCALE * 1.5,
      overflow: 'hidden',
      flexShrink: 0,
      border: `${SCALE * 0.5}px solid #1e3a5f`,
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
      fontSize: SCALE * 6,
    },
    studentInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    studentName: {
      fontSize: SCALE * 3.25,
      fontWeight: 700,
      color: '#1e293b',
      marginBottom: SCALE * 2.5,
      lineHeight: 1.3,
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: SCALE * 1.25,
    },
    infoLabelCard: {
      fontSize: SCALE * 2,
      color: '#64748b',
      width: SCALE * 11,
      fontWeight: 600,
    },
    infoValueCard: {
      fontSize: SCALE * 2.5,
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
      padding: `${SCALE * 1.5}px ${SCALE * 3.5}px`,
      borderTop: `${SCALE * 0.25}px solid #e2e8f0`,
      background: '#f8fafc',
    },
    yearBadge: {
      fontSize: SCALE * 2.25,
      color: '#1e3a5f',
      fontWeight: 600,
    },
    cardTypeBadge: {
      fontSize: SCALE * 1.75,
      backgroundColor: '#c41e3a',
      color: 'white',
      padding: `${SCALE * 0.75}px ${SCALE * 2.5}px`,
      borderRadius: SCALE * 2.5,
      fontWeight: 700,
      letterSpacing: SCALE * 0.25,
      textTransform: 'uppercase',
    },
    // Reverso (fondo blanco para impresión)
    watermark: {
      display: 'none',
    },
    backHeader: {
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
      padding: `${SCALE * 3}px ${SCALE * 3.5}px ${SCALE * 2}px`,
      borderBottom: `${SCALE * 0.5}px solid #1e3a5f`,
    },
    backHeaderRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SCALE * 2.5,
    },
    backEmblemSmall: {
      width: SCALE * 6,
      height: SCALE * 6,
      objectFit: 'contain',
    },
    backTitle: {
      fontSize: SCALE * 2.25,
      fontWeight: 700,
      color: '#1e3a5f',
      letterSpacing: SCALE * 0.25,
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
      padding: `${SCALE * 2.5}px ${SCALE * 5}px`,
    },
    dniNumber: {
      fontSize: SCALE * 3.5,
      fontWeight: 800,
      color: '#1e293b',
      marginTop: SCALE * 2,
      letterSpacing: SCALE * 0.5,
    },
    backFooter: {
      position: 'relative',
      zIndex: 1,
      padding: `${SCALE * 2}px ${SCALE * 3.5}px ${SCALE * 3}px`,
      borderTop: `${SCALE * 0.25}px solid #e2e8f0`,
    },
    footerText: {
      fontSize: SCALE * 1.75,
      color: '#374151',
      textAlign: 'center',
      margin: 0,
      lineHeight: 1.4,
    },
    footerStrong: {
      fontWeight: 700,
      color: '#1e293b',
    },
  };

  const renderCarnet = (student) => {
    if (!student) return null;

    const fullName = `${student.paternal_surname} ${student.maternal_surname}, ${student.first_name}`;
    const gradeText = `${student.grade} Secundaria`;

    return (
      <div style={styles.hiddenArea}>
        {/* ANVERSO */}
        <div ref={frontRef} style={styles.cardFront}>
          <div style={styles.frontHeader}>
            <img src="/images/escudo.png" alt="" style={styles.headerEmblem} crossOrigin="anonymous" />
            <div style={styles.headerCenter}>
              <p style={styles.institutionNameStyle}>{institutionName.toUpperCase()}</p>
              <p style={styles.institutionSubtitle}>Carnet Estudiantil</p>
            </div>
            <img src="/images/logo.png" alt="" style={styles.headerEmblem} crossOrigin="anonymous" />
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
              <div style={styles.infoRow}>
                <span style={styles.infoLabelCard}>DNI</span>
                <span style={styles.infoValueCard}>{student.dni}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabelCard}>GRADO</span>
                <span style={styles.infoValueCard}>{gradeText}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabelCard}>SECCION</span>
                <span style={styles.infoValueCard}>{student.section}</span>
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
          <img src="/images/escudo.png" alt="" style={styles.watermark} crossOrigin="anonymous" />
          <div style={styles.backHeader}>
            <div style={styles.backHeaderRow}>
              <img src="/images/logo.png" alt="" style={styles.backEmblemSmall} crossOrigin="anonymous" />
              <p style={styles.backTitle}>SISTEMA DE CONTROL DE ASISTENCIA</p>
              <img src="/images/escudo.png" alt="" style={styles.backEmblemSmall} crossOrigin="anonymous" />
            </div>
          </div>
          <div style={styles.barcodeSection}>
            <Barcode
              value={student.dni}
              width={SCALE * 0.55}
              height={SCALE * 12.5}
              fontSize={SCALE * 3}
              margin={0}
              displayValue={false}
              background="transparent"
            />
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

  const totalPages = Math.ceil(students.length / 4);
  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div style={styles.overlay} onClick={!generating ? onClose : undefined}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>
          <span style={{ fontSize: '1.5rem' }}>🖨️</span>
          Generar PDF para Imprimir
        </h2>
        <p style={styles.subtitle}>
          PDF optimizado para papel A4 con 4 carnets por hoja
        </p>

        <div style={styles.infoBox}>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Estudiantes:</span>
              <span style={styles.infoValue}>{students.length}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Hojas A4:</span>
              <span style={styles.infoValue}>{totalPages}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Carnets/hoja:</span>
              <span style={styles.infoValue}>4</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Tamaño carnet:</span>
              <span style={styles.infoValue}>85.4 x 54mm</span>
            </div>
          </div>
        </div>

        <div style={styles.instructionsBox}>
          <div style={styles.instructionsTitle}>Instrucciones de impresión:</div>
          <ol style={styles.instructionsList}>
            <li>Imprimir en papel blanco A4</li>
            <li>Cortar por las marcas de las esquinas</li>
            <li>Doblar por la línea punteada central</li>
            <li>Colocar en mica y pasar por laminadora</li>
          </ol>
        </div>

        {generating && (
          <div style={styles.progressBox}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
            </div>
            <div style={styles.progressText}>{progress.phase}</div>
          </div>
        )}

        <div style={styles.actions}>
          {!generating && (
            <button
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={onClose}
            >
              Cancelar
            </button>
          )}
          <button
            style={{ ...styles.btn, ...(generating ? styles.btnDisabled : styles.btnPrimary) }}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Generando...' : 'Generar PDF'}
          </button>
        </div>
      </div>

      {renderCarnet(currentStudent)}
    </div>
  );
}
