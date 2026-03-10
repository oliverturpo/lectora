import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StudentSelector from '../components/advanced/StudentSelector';
import NominaForm from '../components/advanced/NominaForm';
import { useScreenSize } from '../hooks/useScreenSize';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export default function AvanzadoPage() {
  const [activeTab, setActiveTab] = useState('asistencia');
  const { isMobile, isTablet } = useScreenSize();

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    banner: {
      position: 'relative',
      borderRadius: isMobile ? '1rem' : '1.5rem',
      padding: isMobile ? '1.5rem' : '2rem',
      marginBottom: isMobile ? '1.5rem' : '2rem',
      overflow: 'hidden',
      minHeight: isMobile ? '140px' : '160px',
    },
    bannerBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #3b82f6 100%)',
      zIndex: 0,
    },
    bannerContent: {
      position: 'relative',
      zIndex: 2,
      color: 'white',
    },
    title: {
      fontSize: isMobile ? '1.5rem' : '2rem',
      fontWeight: 800,
      marginBottom: '0.5rem',
      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    subtitle: {
      fontSize: isMobile ? '0.85rem' : '1rem',
      opacity: 0.9,
    },
    tabsContainer: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '0.75rem' : '1rem',
      padding: isMobile ? '0.5rem' : '0.75rem',
      marginBottom: isMobile ? '1.5rem' : '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '0.5rem',
    },
    tab: {
      flex: 1,
      padding: isMobile ? '0.75rem' : '1rem 1.5rem',
      fontSize: isMobile ? '0.875rem' : '1rem',
      fontWeight: '600',
      color: '#64748b',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    activeTab: {
      background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
    },
    content: {
      minHeight: isMobile ? '300px' : '400px',
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={styles.container}
    >
      {/* Banner de encabezado */}
      <motion.div variants={itemVariants} style={styles.banner}>
        <div style={styles.bannerBg} />
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ repeat: Infinity, duration: 4 }}
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
            zIndex: 1,
          }}
        />
        <div style={styles.bannerContent}>
          <h1 style={styles.title}>
            <span>📊</span>
            Reportes Avanzados
          </h1>
          <p style={styles.subtitle}>
            Consulta historial de asistencia individual y genera nóminas en PDF
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} style={styles.tabsContainer}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'asistencia' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('asistencia')}
        >
          <span>👤</span>
          Asistencia Individual
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'nominas' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('nominas')}
        >
          <span>📄</span>
          Nóminas
        </button>
      </motion.div>

      {/* Contenido */}
      <motion.div variants={itemVariants} style={styles.content}>
        {activeTab === 'asistencia' && <StudentSelector />}

        {activeTab === 'nominas' && <NominaForm />}
      </motion.div>
    </motion.div>
  );
}
