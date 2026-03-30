import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { configAPI } from './api/endpoints';
import Navbar from './components/common/Navbar';
import Loading from './components/common/Loading';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScannerPage from './pages/ScannerPage';
import StudentsPage from './pages/StudentsPage';
import ReportsPage from './pages/ReportsPage';
import ConfigPage from './pages/ConfigPage';
import AvanzadoPage from './pages/AvanzadoPage';
import CorreccionesPage from './pages/CorreccionesPage';

// Componente para rutas protegidas con permisos por rol
function PrivateRoute({ children, allowedPages = [] }) {
  const { isAuthenticated, loading, canAccessPage, getDefaultRoute } = useAuth();

  if (loading) {
    return <Loading fullPage text="Verificando sesion..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si hay páginas permitidas especificadas, verificar acceso
  if (allowedPages.length > 0) {
    const hasAccess = allowedPages.some(page => canAccessPage(page));
    if (!hasAccess) {
      return <Navigate to={getDefaultRoute()} replace />;
    }
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
  const { isAuthenticated, loading, getDefaultRoute } = useAuth();

  // Cargar configuración y actualizar título del documento
  useEffect(() => {
    const loadInstitutionName = async () => {
      try {
        const response = await configAPI.get();
        const institutionName = response.data.institution_name;
        if (institutionName) {
          document.title = `Sistema de Asistencia - ${institutionName}`;
        }
      } catch (error) {
        // Si no está autenticado o hay error, mantener título genérico
      }
    };
    if (isAuthenticated) {
      loadInstitutionName();
    }
  }, [isAuthenticated]);

  if (loading) {
    return <Loading fullPage text="Cargando..." />;
  }

  const defaultRoute = getDefaultRoute();

  return (
    <Routes>
      {/* Login publico */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to={defaultRoute} replace /> : <Login />
        }
      />

      {/* Dashboard - director y psicólogo */}
      <Route
        path="/"
        element={
          <PrivateRoute allowedPages={['dashboard']}>
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
          <PrivateRoute allowedPages={['scanner']}>
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
          <PrivateRoute allowedPages={['students']}>
            <Layout>
              <StudentsPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Reportes - director y psicólogo */}
      <Route
        path="/reports"
        element={
          <PrivateRoute allowedPages={['reports']}>
            <Layout>
              <ReportsPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Correcciones/Justificar - director, psicólogo y auxiliar */}
      <Route
        path="/correcciones"
        element={
          <PrivateRoute allowedPages={['correcciones']}>
            <Layout>
              <CorreccionesPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Avanzado - director y psicólogo */}
      <Route
        path="/avanzado"
        element={
          <PrivateRoute allowedPages={['avanzado']}>
            <Layout>
              <AvanzadoPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Configuracion - solo director */}
      <Route
        path="/config"
        element={
          <PrivateRoute allowedPages={['config']}>
            <Layout>
              <ConfigPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Catch all - redirigir a ruta por defecto del usuario */}
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  );
}
