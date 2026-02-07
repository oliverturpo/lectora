import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/common/Navbar';
import Loading from './components/common/Loading';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScannerPage from './pages/ScannerPage';
import StudentsPage from './pages/StudentsPage';
import ReportsPage from './pages/ReportsPage';
import ConfigPage from './pages/ConfigPage';

// Componente para rutas protegidas
function PrivateRoute({ children, requireDirector = false }) {
  const { isAuthenticated, loading, isDirector } = useAuth();

  if (loading) {
    return <Loading fullPage text="Verificando sesion..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireDirector && !isDirector) {
    return <Navigate to="/scanner" replace />;
  }

  return children;
}

// Layout con navbar responsive
function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Navbar />
      <main style={{
        padding: isMobile ? '1rem' : '1.5rem',
        paddingBottom: isMobile ? '2rem' : '1.5rem',
      }}>
        {children}
      </main>
    </>
  );
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullPage text="Cargando..." />;
  }

  return (
    <Routes>
      {/* Login publico */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />

      {/* Dashboard - solo director */}
      <Route
        path="/"
        element={
          <PrivateRoute requireDirector>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Scanner - todos los autenticados */}
      <Route
        path="/scanner"
        element={
          <PrivateRoute>
            <Layout>
              <ScannerPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Estudiantes - solo director */}
      <Route
        path="/students"
        element={
          <PrivateRoute requireDirector>
            <Layout>
              <StudentsPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Reportes - solo director */}
      <Route
        path="/reports"
        element={
          <PrivateRoute requireDirector>
            <Layout>
              <ReportsPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Configuracion - solo director */}
      <Route
        path="/config"
        element={
          <PrivateRoute requireDirector>
            <Layout>
              <ConfigPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
