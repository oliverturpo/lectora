import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { INSTITUTION_NAME } from '../config/constants';
import { toast } from 'react-toastify';

// Hook para detectar tamaño de pantalla
function useScreenSize() {
  const [size, setSize] = useState({
    isMobile: window.innerWidth < 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ isMobile: window.innerWidth < 768 });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// Componente de logos flotantes animados
function FloatingLogos() {
  const [logos, setLogos] = useState([]);

  useEffect(() => {
    // Crear logos en posiciones aleatorias
    const createLogo = () => {
      const id = Date.now() + Math.random();
      const logo = {
        id,
        x: Math.random() * 80 + 10, // 10% - 90%
        y: Math.random() * 80 + 10,
        scale: Math.random() * 0.5 + 0.3, // 0.3 - 0.8
        duration: Math.random() * 2 + 3, // 3-5 segundos
      };

      setLogos(prev => [...prev, logo]);

      // Remover después de la animación
      setTimeout(() => {
        setLogos(prev => prev.filter(l => l.id !== id));
      }, logo.duration * 1000);
    };

    // Crear logo inicial
    createLogo();

    // Crear logos cada 2-4 segundos
    const interval = setInterval(() => {
      createLogo();
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <AnimatePresence>
        {logos.map(logo => (
          <motion.img
            key={logo.id}
            src="/images/logo.png"
            alt=""
            initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
            animate={{
              opacity: [0, 0.15, 0.15, 0],
              scale: [0, logo.scale, logo.scale, 0],
            }}
            transition={{
              duration: logo.duration,
              times: [0, 0.2, 0.8, 1],
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              left: `${logo.x}%`,
              top: `${logo.y}%`,
              width: '120px',
              height: '120px',
              objectFit: 'contain',
              filter: 'brightness(1.5)',
            }}
            onError={(e) => e.target.style.display = 'none'}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Componente de partículas flotantes
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: '110vh',
            opacity: 0
          }}
          animate={{
            y: '-10vh',
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.4)',
          }}
        />
      ))}
    </div>
  );
}

// Componente de frases rotativas
function RotatingPhrases() {
  const phrases = [
    "ESTUDIAR PARA TRIUNFAR",
    "HOY MEJOR QUE AYER, MAÑANA MEJOR QUE HOY"
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % phrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            letterSpacing: '2px',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          "{phrases[currentIndex]}"
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// Componente de onda animada
function AnimatedWave() {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden', height: '150px', pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, width: '200%', height: '100%' }}
      >
        <motion.path
          fill="rgba(255,255,255,0.05)"
          animate={{
            d: [
              "M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,192L48,197.3C96,203,192,213,288,202.7C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      </svg>
      <motion.div
        animate={{ x: ['-50%', '0%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', bottom: 0, width: '200%', height: '100%' }}
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '50%', height: '100%', display: 'inline-block' }}>
          <path fill="rgba(255,255,255,0.03)" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,128C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '50%', height: '100%', display: 'inline-block' }}>
          <path fill="rgba(255,255,255,0.03)" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,128C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
        </svg>
      </motion.div>
    </div>
  );
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isMobile } = useScreenSize();

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      toast.success(`Bienvenido, ${user.full_name || user.username}`);

      if (user.role === 'director') {
        navigate('/');
      } else {
        navigate('/scanner');
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Credenciales incorrectas';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  // ==================== ESTILOS ====================
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#0a0f1c',
      position: 'relative',
      overflow: 'hidden',
    },

    // Panel izquierdo (branding)
    brandPanel: {
      display: isMobile ? 'none' : 'flex',
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      position: 'relative',
      background: 'linear-gradient(135deg, #0f2744 0%, #0a1628 50%, #071020 100%)',
    },

    // Gradiente animado de fondo
    gradientOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at 30% 20%, rgba(30, 64, 175, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
      pointerEvents: 'none',
    },

    brandContent: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },

    brandLogo: {
      width: '160px',
      height: '160px',
      objectFit: 'contain',
      marginBottom: '1.5rem',
      filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.4))',
    },

    brandTitle: {
      fontSize: '2.25rem',
      fontWeight: 800,
      color: 'white',
      marginBottom: '0.5rem',
      letterSpacing: '1px',
      textShadow: '0 2px 20px rgba(0,0,0,0.5)',
    },

    brandSubtitle: {
      fontSize: '1.1rem',
      color: 'rgba(255,255,255,0.7)',
      marginBottom: '2rem',
    },

    // Panel derecho (formulario)
    formPanel: {
      flex: isMobile ? 1 : '0 0 480px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '2rem 1.5rem' : '3rem',
      backgroundColor: '#ffffff',
      position: 'relative',
      zIndex: 20,
    },

    formCard: {
      width: '100%',
      maxWidth: '380px',
    },

    formHeader: {
      textAlign: 'center',
      marginBottom: '2rem',
    },

    formLogo: {
      width: '90px',
      height: '90px',
      objectFit: 'contain',
      marginBottom: '1rem',
    },

    formTitle: {
      fontSize: isMobile ? '1.5rem' : '1.75rem',
      fontWeight: 700,
      color: '#1e293b',
      marginBottom: '0.5rem',
    },

    formSubtitle: {
      fontSize: '0.95rem',
      color: '#64748b',
    },

    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    },

    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },

    label: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#475569',
    },

    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },

    inputIcon: {
      position: 'absolute',
      left: '1rem',
      color: '#94a3b8',
      pointerEvents: 'none',
      display: 'flex',
    },

    input: {
      width: '100%',
      padding: '0.875rem 1rem 0.875rem 3rem',
      border: '2px solid #e2e8f0',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 200ms',
      backgroundColor: 'white',
    },

    passwordToggle: {
      position: 'absolute',
      right: '1rem',
      background: 'none',
      border: 'none',
      color: '#94a3b8',
      cursor: 'pointer',
      padding: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    button: {
      marginTop: '0.5rem',
      padding: '1rem',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)',
      position: 'relative',
      overflow: 'hidden',
    },

    buttonShine: {
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    },

    buttonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },

    error: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      padding: '0.875rem 1rem',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      border: '1px solid #fecaca',
    },

    footer: {
      marginTop: '2rem',
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: '0.8rem',
    },

  };

  // Iconos
  const Icons = {
    user: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    lock: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    eye: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    eyeOff: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    ),
    alertCircle: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    login: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
        <polyline points="10 17 15 12 10 7"/>
        <line x1="15" y1="12" x2="3" y2="12"/>
      </svg>
    ),
  };

  // ==================== MOBILE LAYOUT ====================
  if (isMobile) {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(180deg, #0f2744 0%, #1e3a5f 50%, #1e40af 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Partículas de fondo mobile */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={i}
              initial={{ y: '100vh', opacity: 0 }}
              animate={{ y: '-10vh', opacity: [0, 0.5, 0] }}
              transition={{
                duration: 8 + Math.random() * 4,
                delay: Math.random() * 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                width: 3 + Math.random() * 3,
                height: 3 + Math.random() * 3,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>

        {/* Header con logo - altura fija */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '1.5rem 1rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <motion.img
            src="/images/logo.png"
            alt="Logo"
            style={{
              width: '70px',
              height: '70px',
              objectFit: 'contain',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            onError={(e) => {
              e.target.src = '/images/logo.jpg';
              e.target.onerror = () => e.target.style.display = 'none';
            }}
          />

          {/* Nombre */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              color: 'white',
              fontSize: '1rem',
              fontWeight: 700,
              marginTop: '0.5rem',
              textAlign: 'center',
            }}
          >
            {INSTITUTION_NAME}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.75rem',
              marginTop: '0.125rem',
            }}
          >
            Sistema de Asistencia
          </motion.p>
        </motion.div>

        {/* Card del formulario - ocupa el resto */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '1.5rem 1.5rem 0 0',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 2,
            boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Indicador */}
          <div style={{
            width: '40px',
            height: '4px',
            backgroundColor: '#e2e8f0',
            borderRadius: '2px',
            margin: '0 auto 1rem auto',
          }} />

          {/* Título */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
              Bienvenido
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Ingresa tus credenciales
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', flex: 1 }}>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  ...styles.error,
                  padding: '0.625rem 0.875rem',
                  fontSize: '0.8rem',
                }}
              >
                {Icons.alertCircle}
                {error}
              </motion.div>
            )}

            <div style={styles.inputGroup}>
              <label style={{ ...styles.label, fontSize: '0.8rem' }}>Usuario</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>{Icons.user}</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ ...styles.input, padding: '0.75rem 1rem 0.75rem 2.75rem', fontSize: '0.95rem' }}
                  placeholder="Ingrese su usuario"
                  required
                  autoCapitalize="none"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1e40af';
                    e.target.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={{ ...styles.label, fontSize: '0.8rem' }}>Contrasena</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>{Icons.lock}</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...styles.input, padding: '0.75rem 2.75rem 0.75rem 2.75rem', fontSize: '0.95rem' }}
                  placeholder="Ingrese su contrasena"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1e40af';
                    e.target.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? Icons.eyeOff : Icons.eye}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
                marginTop: '0.5rem',
                padding: '0.875rem',
              }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 20, height: 20, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                />
              ) : (
                <>
                  {Icons.login}
                  Ingresar
                </>
              )}
            </motion.button>

            {/* Spacer flexible */}
            <div style={{ flex: 1 }} />

            {/* Footer dentro del form para que quede abajo */}
            <div style={{
              textAlign: 'center',
              paddingTop: '0.75rem',
              borderTop: '1px solid #f1f5f9',
            }}>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
                "Estudiar para triunfar"
              </p>
              <p style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                Ano {currentYear} · Puno, Peru
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // ==================== DESKTOP LAYOUT ====================
  return (
    <div style={styles.container}>
      {/* Panel izquierdo - Branding */}
      <div style={styles.brandPanel}>
        {/* Gradiente de fondo */}
        <div style={styles.gradientOverlay} />

        {/* Partículas flotantes */}
        <FloatingParticles />

        {/* Logos flotantes */}
        <FloatingLogos />

        {/* Onda animada */}
        <AnimatedWave />

        {/* Contenido principal */}
        <motion.div
          style={styles.brandContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo principal con animación de pulso */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1, delay: 0.2 }}
          >
            <motion.img
              src="/images/logo.png"
              alt="Logo IES"
              style={styles.brandLogo}
              animate={{
                filter: [
                  'drop-shadow(0 0 30px rgba(59, 130, 246, 0.4))',
                  'drop-shadow(0 0 50px rgba(59, 130, 246, 0.6))',
                  'drop-shadow(0 0 30px rgba(59, 130, 246, 0.4))',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              onError={(e) => {
                e.target.src = '/images/logo.jpg';
                e.target.onerror = () => e.target.style.display = 'none';
              }}
            />
          </motion.div>

          {/* Título con efecto de escritura */}
          <motion.h1
            style={styles.brandTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {INSTITUTION_NAME}
          </motion.h1>

          <motion.p
            style={styles.brandSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Sistema de Control de Asistencia
          </motion.p>

          {/* Frases rotativas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <RotatingPhrases />
          </motion.div>

          {/* Línea decorativa */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '150px' }}
            transition={{ delay: 1.2, duration: 0.8 }}
            style={{
              height: '3px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              marginTop: '1.5rem',
            }}
          />

          {/* Año */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{
              marginTop: '1.5rem',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem',
            }}
          >
            Ano Escolar {currentYear}
          </motion.p>
        </motion.div>
      </div>

      {/* Panel derecho - Formulario */}
      <motion.div
        style={styles.formPanel}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div style={styles.formCard}>
          {/* Header */}
          <motion.div
            style={styles.formHeader}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 style={styles.formTitle}>Iniciar Sesion</h2>
            <p style={styles.formSubtitle}>Ingresa tus credenciales para continuar</p>
          </motion.div>

          {/* Formulario */}
          <motion.form
            onSubmit={handleSubmit}
            style={styles.form}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                style={styles.error}
              >
                {Icons.alertCircle}
                {error}
              </motion.div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Usuario</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>{Icons.user}</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  placeholder="Ingrese su usuario"
                  required
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1e40af';
                    e.target.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contrasena</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>{Icons.lock}</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  placeholder="Ingrese su contrasena"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1e40af';
                    e.target.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? Icons.eyeOff : Icons.eye}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
              whileHover={!loading ? { scale: 1.02, boxShadow: '0 6px 25px rgba(30, 64, 175, 0.4)' } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {/* Efecto de brillo */}
              <motion.div
                style={styles.buttonShine}
                animate={{ left: ['−100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 20, height: 20, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                  />
                  Ingresando...
                </>
              ) : (
                <>
                  {Icons.login}
                  Ingresar al Sistema
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.div
            style={styles.footer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>Puno - Peru</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
