import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAttendance } from '../contexts/AttendanceContext';
import { useAuth } from '../contexts/AuthContext';
import { configAPI } from '../api/endpoints';
import Loading from '../components/common/Loading';
import { useScreenSize } from '../hooks/useScreenSize';

// Animaciones
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

const cardHover = {
  scale: 1.02,
  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
  transition: { type: 'spring', stiffness: 300 }
};

// Componente de Tarjeta de Estadistica Animada
function StatCard({ icon, value, label, color, gradient, delay, isMobile }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={cardHover}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: isMobile ? '1rem' : '1.25rem',
        padding: isMobile ? '1rem' : '1.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.8)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Efecto de brillo */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: gradient,
        opacity: 0.1,
        borderRadius: '50%',
        transform: 'translate(30%, -30%)',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '0.75rem' : '1rem',
      }}>
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          style={{
            width: isMobile ? '50px' : '60px',
            height: isMobile ? '50px' : '60px',
            borderRadius: '1rem',
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '1.5rem' : '1.75rem',
            boxShadow: `0 8px 20px ${color}40`,
          }}
        >
          {icon}
        </motion.div>

        <div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay, type: 'spring', stiffness: 200 }}
            style={{
              fontSize: isMobile ? '2rem' : '2.5rem',
              fontWeight: 800,
              background: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
            }}
          >
            {value}
          </motion.div>
          <div style={{
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: '0.25rem',
          }}>
            {label}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente de Progreso Circular Animado
function AnimatedProgress({ percent, isMobile }) {
  const size = isMobile ? 140 : 180;
  const strokeWidth = isMobile ? 12 : 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (percent / 100) * circumference }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          style={{
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {percent}%
        </motion.div>
        <div style={{
          fontSize: '0.7rem',
          color: '#64748b',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}>
          Asistencia
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { stats, currentSession, loadCurrentSession, loadStats } = useAttendance();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [config, setConfig] = useState({
    open_time: '07:30',
    punctuality_limit: '07:45',
    close_time: '08:00',
    institution_name: '',
  });
  const { isMobile } = useScreenSize();

  useEffect(() => {
    const init = async () => {
      try {
        const [, , configRes] = await Promise.all([
          loadCurrentSession(),
          loadStats(),
          configAPI.get()
        ]);
        if (configRes.data) {
          setConfig(configRes.data);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
      setLoading(false);
    };
    init();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [loadCurrentSession, loadStats]);

  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const total = Math.max(0, stats.total || 0);
  const present = Math.max(0, stats.present || 0);
  const late = Math.max(0, stats.late || 0);
  const absent = Math.max(0, stats.absent || 0);
  const attendancePercent = total > 0 ? Math.min(100, Math.round(((present + late) / total) * 100)) : 0;

  const isDirector = user?.role === 'director';

  const directorActions = [
    { to: '/scanner', icon: '📷', title: 'Escanear', desc: 'Registrar asistencia', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { to: '/students', icon: '👥', title: 'Estudiantes', desc: 'Gestionar alumnos', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { to: '/reports', icon: '📊', title: 'Reportes', desc: 'Descargar informes', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { to: '/config', icon: '⚙️', title: 'Configuracion', desc: 'Ajustar sistema', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  ];

  const auxiliarActions = [
    { to: '/scanner', icon: '📷', title: 'Escanear Asistencia', desc: 'Registrar con codigo de barras', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  ];

  const actions = isDirector ? directorActions : auxiliarActions;

  if (loading) {
    return <Loading text="Cargando dashboard..." />;
  }

  // ========== VISTA AUXILIAR (Simplificada) ==========
  if (!isDirector) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ maxWidth: '1200px', margin: '0 auto' }}
      >
        {/* Header simple */}
        <motion.div
          variants={itemVariants}
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #0ea5e9 100%)',
            borderRadius: isMobile ? '1rem' : '1.5rem',
            padding: isMobile ? '1.25rem' : '2rem',
            marginBottom: isMobile ? '1rem' : '2rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: isMobile ? '0.7rem' : '0.875rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              {config.institution_name}
            </div>
            <h1 style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Control de Asistencia
            </h1>
            <div style={{ fontSize: isMobile ? '0.8rem' : '1rem', opacity: 0.9 }}>{today}</div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              backgroundColor: currentSession ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: currentSession ? '#86efac' : '#fca5a5',
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: currentSession ? '#22c55e' : '#ef4444',
            }} />
            {currentSession ? 'Sesion Activa' : 'Sin Sesion'}
          </motion.div>
        </motion.div>

        {/* Boton grande para escanear */}
        <motion.div variants={itemVariants}>
          <Link
            to="/scanner"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              color: 'white',
              borderRadius: isMobile ? '1rem' : '1.5rem',
              padding: isMobile ? '2rem 1.5rem' : '3rem 2rem',
              textDecoration: 'none',
              marginBottom: isMobile ? '1rem' : '1.5rem',
              boxShadow: '0 10px 40px rgba(30, 64, 175, 0.4)',
            }}
          >
            <div style={{ fontSize: isMobile ? '3rem' : '4rem', marginBottom: '1rem' }}>📷</div>
            <div style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Escanear Asistencia
            </div>
            <div style={{ opacity: 0.9, fontSize: isMobile ? '0.875rem' : '1rem' }}>
              Toca para registrar con codigo de barras
            </div>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: isMobile ? '0.5rem' : '1rem',
            marginBottom: '1rem',
          }}
        >
          <StatCard icon="📚" value={total} label="Total" color="#3b82f6" gradient="linear-gradient(135deg, #3b82f6, #1d4ed8)" delay={0.2} isMobile={isMobile} />
          <StatCard icon="✅" value={present} label="Presentes" color="#10b981" gradient="linear-gradient(135deg, #10b981, #059669)" delay={0.3} isMobile={isMobile} />
          <StatCard icon="⏰" value={late} label="Tardanzas" color="#f59e0b" gradient="linear-gradient(135deg, #f59e0b, #d97706)" delay={0.4} isMobile={isMobile} />
          <StatCard icon="❌" value={absent} label="Faltas" color="#ef4444" gradient="linear-gradient(135deg, #ef4444, #dc2626)" delay={0.5} isMobile={isMobile} />
        </motion.div>

        {/* Reloj */}
        <motion.div
          variants={itemVariants}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: isMobile ? '1rem' : '1.5rem',
            padding: isMobile ? '1.5rem' : '2rem',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{
            fontSize: isMobile ? '3rem' : '4rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {currentTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            display: 'flex',
            justifyContent: 'space-around',
            fontSize: isMobile ? '0.75rem' : '0.875rem',
          }}>
            <span>Entrada: <strong>{config.open_time}</strong></span>
            <span>Limite: <strong>{config.punctuality_limit}</strong></span>
            <span>Cierre: <strong>{config.close_time}</strong></span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ========== VISTA DIRECTOR (Completa) ==========
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ maxWidth: '1200px', margin: '0 auto' }}
    >
      {/* Banner de bienvenida con logo */}
      <motion.div
        variants={itemVariants}
        style={{
          position: 'relative',
          borderRadius: isMobile ? '1.5rem' : '2rem',
          padding: isMobile ? '1.5rem' : '2.5rem',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          overflow: 'hidden',
          minHeight: isMobile ? '200px' : '220px',
        }}
      >
        {/* Fondo con gradiente */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 70%, #3b82f6 100%)',
          zIndex: 0,
        }} />

        {/* Logo de fondo */}
        <div style={{
          position: 'absolute',
          top: '50%',
          right: isMobile ? '-20px' : '40px',
          transform: 'translateY(-50%)',
          width: isMobile ? '180px' : '280px',
          height: isMobile ? '180px' : '280px',
          backgroundImage: 'url(/images/logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.15,
          zIndex: 1,
        }} />

        {/* Efecto de brillo */}
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

        {/* Contenido */}
        <div style={{ position: 'relative', zIndex: 2, color: 'white' }}>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '2rem',
              marginBottom: '1rem',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              backgroundImage: 'url(/images/logo.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }} />
            <span style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              {config.institution_name}
            </span>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: isMobile ? '1.75rem' : '2.5rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            Sistema de Asistencia
          </motion.h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              opacity: 0.9,
              marginBottom: '1rem',
              textTransform: 'capitalize',
            }}
          >
            {today}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Info del usuario */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '2rem',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem',
              }}>
                {user?.full_name ? user.full_name[0].toUpperCase() : '👤'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {user?.full_name || user?.username}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Director</div>
              </div>
            </div>

            {/* Estado de sesion */}
            <motion.div
              animate={{ scale: currentSession ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: currentSession ? Infinity : 0, duration: 2 }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: currentSession ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${currentSession ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: currentSession ? '#22c55e' : '#ef4444',
                  boxShadow: `0 0 10px ${currentSession ? '#22c55e' : '#ef4444'}`,
                }}
              />
              {currentSession ? 'Sesion Activa' : 'Sin Sesion Activa'}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Estadisticas principales */}
      <motion.div
        variants={containerVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '0.75rem' : '1.25rem',
          marginBottom: isMobile ? '1.5rem' : '2rem',
        }}
      >
        <StatCard
          icon="📚"
          value={total}
          label="Total Estudiantes"
          color="#3b82f6"
          gradient="linear-gradient(135deg, #3b82f6, #1d4ed8)"
          delay={0.2}
          isMobile={isMobile}
        />
        <StatCard
          icon="✅"
          value={present}
          label="Presentes"
          color="#10b981"
          gradient="linear-gradient(135deg, #10b981, #059669)"
          delay={0.3}
          isMobile={isMobile}
        />
        <StatCard
          icon="⏰"
          value={late}
          label="Tardanzas"
          color="#f59e0b"
          gradient="linear-gradient(135deg, #f59e0b, #d97706)"
          delay={0.4}
          isMobile={isMobile}
        />
        <StatCard
          icon="❌"
          value={absent}
          label="Faltas"
          color="#ef4444"
          gradient="linear-gradient(135deg, #ef4444, #dc2626)"
          delay={0.5}
          isMobile={isMobile}
        />
      </motion.div>

      {/* Seccion central */}
      <motion.div
        variants={containerVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '1rem' : '1.5rem',
          marginBottom: isMobile ? '1.5rem' : '2rem',
        }}
      >
        {/* Asistencia del dia */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: isMobile ? '1rem' : '1.5rem',
            padding: isMobile ? '1.25rem' : '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.8)',
          }}
        >
          <div style={{
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              📈
            </span>
            Asistencia del Dia
          </div>

          <AnimatedProgress percent={attendancePercent} isMobile={isMobile} />

          <div style={{
            textAlign: 'center',
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            borderRadius: '0.75rem',
            color: '#0369a1',
            fontWeight: 500,
            fontSize: isMobile ? '0.8rem' : '0.9rem',
          }}>
            {present + late} de {total} estudiantes presentes
          </div>
        </motion.div>

        {/* Reloj y estado */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: isMobile ? '1rem' : '1.5rem',
            padding: isMobile ? '1.25rem' : '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.8)',
          }}
        >
          <div style={{
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              🕐
            </span>
            Hora Actual
          </div>

          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              fontSize: isMobile ? '3rem' : '3.5rem',
              fontWeight: 800,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.5rem',
            }}
          >
            {currentTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </motion.div>
          <div style={{
            fontSize: '1rem',
            color: '#64748b',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            {currentTime.toLocaleTimeString('es-PE', { second: '2-digit' }).split(':').pop()} segundos
          </div>

          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
            borderRadius: '1rem',
          }}>
            <div style={{
              fontSize: '0.7rem',
              color: '#7c3aed',
              marginBottom: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Horario de Asistencia
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              textAlign: 'center',
              fontSize: isMobile ? '0.75rem' : '0.85rem',
            }}>
              <div style={{
                padding: '0.5rem',
                background: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}>
                <div style={{ color: '#64748b', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Entrada</div>
                <div style={{ fontWeight: 700, color: '#10b981' }}>{config.open_time}</div>
              </div>
              <div style={{
                padding: '0.5rem',
                background: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}>
                <div style={{ color: '#64748b', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Limite</div>
                <div style={{ fontWeight: 700, color: '#f59e0b' }}>{config.punctuality_limit}</div>
              </div>
              <div style={{
                padding: '0.5rem',
                background: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}>
                <div style={{ color: '#64748b', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Cierre</div>
                <div style={{ fontWeight: 700, color: '#ef4444' }}>{config.close_time}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Acciones rapidas */}
      <motion.div variants={itemVariants}>
        <h2 style={{
          fontSize: isMobile ? '1rem' : '1.1rem',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>⚡</span> Acciones Rapidas
        </h2>
      </motion.div>

      <motion.div
        variants={containerVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '0.75rem' : '1rem',
        }}
      >
        {actions.map((action) => (
          <motion.div
            key={action.to}
            variants={itemVariants}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={action.to}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: isMobile ? '1rem' : '1.25rem',
                padding: isMobile ? '1.25rem 1rem' : '1.75rem 1.25rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid rgba(255,255,255,0.8)',
                transition: 'all 0.3s ease',
              }}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                style={{
                  width: isMobile ? '56px' : '64px',
                  height: isMobile ? '56px' : '64px',
                  borderRadius: '1rem',
                  background: action.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '1.75rem' : '2rem',
                  marginBottom: '1rem',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                }}
              >
                {action.icon}
              </motion.div>
              <div style={{
                fontWeight: 700,
                color: '#1e293b',
                fontSize: isMobile ? '0.9rem' : '1rem',
                marginBottom: '0.25rem',
              }}>
                {action.title}
              </div>
              <div style={{
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                color: '#64748b',
                lineHeight: 1.4,
              }}>
                {action.desc}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
