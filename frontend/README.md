# Frontend - Sistema de Asistencia

Frontend del sistema de asistencia construido con React 18.

## 🏗️ Estructura

### Componentes

#### `/components/common`
- `Navbar.js` - Barra de navegación
- `Loading.js` - Spinner de carga
- `Alert.js` - Alertas y notificaciones

#### `/components/scanner`
- `ScannerView.js` - Vista principal de escaneo
- `AttendanceList.js` - Lista de últimos escaneos
- `StudentCard.js` - Tarjeta de estudiante escaneado

#### `/components/students`
- `StudentList.js` - Lista de estudiantes
- `StudentForm.js` - Formulario de registro/edición
- `StudentCard.js` - Tarjeta de estudiante

#### `/components/reports`
- `ReportList.js` - Lista de reportes disponibles
- `Statistics.js` - Estadísticas y gráficos

### Páginas

- `Login.js` - Página de login
- `Dashboard.js` - Dashboard del Director
- `ScannerPage.js` - Página de escaneo (Auxiliares)
- `StudentsPage.js` - Gestión de estudiantes
- `ReportsPage.js` - Descarga de reportes
- `ConfigPage.js` - Configuración del sistema

### Contexts

#### `AuthContext`
Maneja:
- Autenticación con JWT
- Login/Logout
- Refresh de tokens
- Estado del usuario actual

#### `AttendanceContext`
Maneja:
- Conexión WebSocket
- Estado de la sesión actual
- Contadores en tiempo real
- Últimos escaneos

### Hooks

#### `useAuth`
```javascript
const { user, login, logout, isAuthenticated } = useAuth();
```

#### `useWebSocket`
```javascript
const { 
  connected, 
  sendMessage, 
  lastMessage,
  counters 
} = useWebSocket();
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm start                 # Inicia dev server (puerto 3000)

# Producción
npm run build            # Build para producción
npm run preview          # Preview del build

# Testing
npm test                 # Ejecuta tests
npm run test:coverage    # Tests con coverage

# Linting
npm run lint             # Verifica código
npm run lint:fix         # Corrige automáticamente
```

## 🔌 WebSocket

La conexión WebSocket se establece automáticamente al entrar a la página de escaneo:

```javascript
// En ScannerPage.js
const { connected, sendMessage, lastMessage } = useWebSocket();

// Enviar escaneo
const handleScan = (dni) => {
  sendMessage({
    type: 'scan_attendance',
    dni: dni,
    laptop_id: 'LAPTOP_001'
  });
};

// Recibir actualizaciones
useEffect(() => {
  if (lastMessage?.type === 'attendance_registered') {
    showNotification(lastMessage.data);
    updateCounters(lastMessage.counters);
  }
}, [lastMessage]);
```

## 🎨 Estilos

### Variables CSS

En `src/styles/variables.css`:
```css
:root {
  --primary-color: #2563eb;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --bg-color: #f3f4f6;
}
```

### Global Styles

En `src/styles/global.css` están los estilos base y reset.

## 🔧 Configuración

### Variables de Entorno (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_INSTITUTION_NAME=IES Túpac Amaru
```

### Axios Config

En `src/api/axios.js` se configura:
- Base URL
- Interceptores para JWT
- Manejo de errores

## 📱 Responsive Design

El sistema es responsive y funciona en:
- Desktop (1920x1080+)
- Tablet (768x1024)
- Mobile (375x667+)

## 🎯 Características Principales

### Para Director
- Dashboard con estadísticas en tiempo real
- Gestión completa de estudiantes
- Generación y descarga de carnets
- Descarga de reportes
- Configuración del sistema

### Para Auxiliares
- Pantalla de escaneo full-screen
- Contadores en tiempo real
- Notificaciones visuales y sonoras
- Búsqueda manual de estudiantes
- Lista de últimos escaneos

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm test -- --watch
```

## 🚀 Deployment

### Build para Producción

```bash
npm run build
```

El build se genera en `/build` y está listo para ser servido con cualquier servidor estático.

### Deploy en Nginx

```nginx
server {
    listen 80;
    server_name asistencia.iestupacamaru.edu.pe;

    root /var/www/asistencia-frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🐛 Debugging

### React DevTools
Instalar la extensión React DevTools para Chrome/Firefox.

### Console Logs
En desarrollo, activar logs detallados:
```javascript
// src/config/constants.js
export const DEBUG = process.env.REACT_APP_DEBUG === 'true';
```

## 📦 Dependencias Principales

- `react` - Framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `react-toastify` - Notificaciones
- `date-fns` - Manejo de fechas

