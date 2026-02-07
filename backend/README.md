# Backend - Sistema de Asistencia

Backend del sistema de asistencia construido con Django 5.0, Django REST Framework y Channels.

## 🏗️ Arquitectura

### Apps

#### `apps/students`
- Gestión de estudiantes (CRUD)
- Generación de códigos de barras
- Generación de carnets (PDF)
- Subida de fotos

#### `apps/attendance`
- Modelos de sesiones y asistencias
- WebSocket consumers para sincronización en tiempo real
- Scheduler para cierre automático
- Validaciones de escaneo

#### `apps/users`
- Autenticación con JWT
- Gestión de usuarios (Director/Auxiliar)
- Permisos por rol

#### `apps/reports`
- Generación de reportes en Excel
- Generación de reportes en PDF
- Estadísticas y gráficos
- Descarga de archivos

### Core
- Middlewares (Auditoría, CORS)
- Permissions personalizados
- Utilidades compartidas

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/login/          # Login con JWT
POST   /api/auth/logout/         # Logout
POST   /api/auth/refresh/        # Refresh token
GET    /api/auth/me/             # Usuario actual
```

### Estudiantes
```
GET    /api/students/                    # Listar todos
POST   /api/students/                    # Crear nuevo
GET    /api/students/{id}/               # Ver detalle
PUT    /api/students/{id}/               # Actualizar
DELETE /api/students/{id}/               # Eliminar
POST   /api/students/{id}/upload-photo/  # Subir foto
```

### Carnets
```
POST   /api/carnets/generate/            # Generar carnets
GET    /api/carnets/download/{filename}/ # Descargar PDF
```

### Sesiones y Asistencias
```
GET    /api/sessions/                    # Listar sesiones
GET    /api/sessions/current/            # Sesión actual
POST   /api/sessions/open/               # Abrir manualmente
POST   /api/sessions/close/              # Cerrar manualmente

GET    /api/attendances/                 # Listar asistencias
POST   /api/attendances/manual/          # Registro manual
```

### Reportes
```
GET    /api/reports/daily/?date=YYYY-MM-DD
GET    /api/reports/by-grade/
GET    /api/reports/by-section/
POST   /api/reports/export/
```

## 🔌 WebSocket

### Conexión
```
ws://localhost:8000/ws/attendance/
```

### Mensajes

**Cliente → Servidor:**
```json
{
    "type": "scan_attendance",
    "dni": "72345678",
    "laptop_id": "LAPTOP_001"
}
```

**Servidor → Todos los Clientes:**
```json
{
    "type": "attendance_registered",
    "status": "success",
    "data": { ... },
    "counters": { ... }
}
```

## 🔧 Configuración

### Variables de Entorno (.env)

Ver `.env.example` para todas las variables disponibles.

Principales:
- `DEBUG`: Modo debug
- `SECRET_KEY`: Clave secreta de Django
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Configuración de PostgreSQL
- `ATTENDANCE_OPEN_TIME`: Hora de apertura (HH:MM)
- `ATTENDANCE_CLOSE_TIME`: Hora de cierre (HH:MM)

### Scheduler (APScheduler)

El cierre automático está configurado en `apps/attendance/scheduler.py` y se inicia automáticamente cuando Django arranca.

## 🧪 Testing

```bash
# Ejecutar tests
python manage.py test

# Con coverage
coverage run --source='.' manage.py test
coverage report
```

## 📦 Comandos Personalizados

```bash
# Limpiar datos antiguos
python manage.py cleanup_old_data

# Generar reportes manualmente
python manage.py generate_reports --date 2026-01-15
```

## 🔐 Seguridad

- JWT con tokens de 24h de duración
- Refresh tokens de 7 días
- Middleware de auditoría
- Rate limiting
- Input sanitization

## 📝 Logs

Los logs se guardan en:
- `logs/django.log` - Logs generales
- `logs/attendance.log` - Logs de asistencia
- `logs/audit.log` - Logs de auditoría

## 🚀 Deployment

Para producción:
1. Cambiar `DEBUG=False`
2. Configurar `ALLOWED_HOSTS`
3. Usar servidor ASGI (Daphne)
4. Configurar Nginx como proxy reverso
5. Usar systemd o Supervisor para gestión de procesos

