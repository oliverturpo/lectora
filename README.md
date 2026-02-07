# Sistema de Asistencia - IES Túpac Amaru

Sistema de control de asistencia escolar mediante escaneo de códigos de barras con sincronización en tiempo real.

## 📋 Descripción

Sistema para registrar asistencia diaria de ~200 estudiantes (1ro a 5to secundaria) mediante escaneo de carnets con código de barras. Funciona con múltiples laptops sincronizadas en tiempo real vía WebSockets.

### Características Principales

- ✅ Registro masivo de estudiantes con fotos
- ✅ Generación automática de carnets con código de barras
- ✅ Escaneo de asistencia en tiempo real
- ✅ Sincronización entre 2-3 laptops (WebSockets)
- ✅ Cierre automático del sistema
- ✅ Generación automática de reportes (Excel/PDF)
- ✅ Estadísticas en tiempo real

## 🔧 Stack Tecnológico

### Backend
- **Framework:** Django 5.0
- **API REST:** Django REST Framework
- **WebSockets:** Django Channels
- **Base de datos:** PostgreSQL
- **Scheduler:** APScheduler

### Frontend
- **Framework:** React 18
- **Estado:** Context API
- **WebSockets:** Native WebSocket API
- **HTTP Client:** Axios
- **UI:** React Toastify

## 📁 Estructura del Proyecto

```
asistencia-tupac/
├── backend/                    # Django Backend
│   ├── apps/
│   │   ├── students/          # Gestión de estudiantes
│   │   ├── attendance/        # Asistencia y WebSockets
│   │   ├── users/             # Autenticación
│   │   └── reports/           # Generación de reportes
│   ├── config/                # Configuración Django
│   ├── core/                  # Utilidades compartidas
│   ├── media/                 # Archivos subidos
│   ├── scripts/               # Scripts de mantenimiento
│   └── requirements.txt
│
├── frontend/                   # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/               # Configuración de Axios
│   │   ├── components/        # Componentes React
│   │   ├── contexts/          # Context API
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Páginas principales
│   │   └── utils/             # Utilidades
│   └── package.json
│
└── SISTEMA_ASISTENCIA_IES.md  # Documentación completa
```

## 🚀 Instalación y Configuración

### Requisitos Previos

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd asistencia-tupac
```

### 2. Configurar Backend (Django)

```bash
# Navegar a la carpeta backend
cd backend

# Crear entorno virtual
python -m venv venv

# En Linux/Mac:
source venv/Scripts/activate


# Instalar dependencias
pip install -r requirements.txt

# Copiar archivo de ejemplo de variables de entorno
cp .env.example .env

# Editar .env con tus configuraciones
nano .env  # o el editor de tu preferencia
```

### 3. Configurar PostgreSQL

```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE asistencia_db;
CREATE USER asistencia_user WITH PASSWORD 'tu_password';
ALTER ROLE asistencia_user SET client_encoding TO 'utf8';
ALTER ROLE asistencia_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE asistencia_user SET timezone TO 'America/Lima';
GRANT ALL PRIVILEGES ON DATABASE asistencia_db TO asistencia_user;
\q
```

### 4. Ejecutar Migraciones

```bash
# Desde backend/
python manage.py makemigrations
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser
```

### 5. Configurar Frontend (React)

```bash
# Navegar a la carpeta frontend
cd ../frontend

# Instalar dependencias
npm install

# Copiar archivo de ejemplo de variables de entorno
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

### 6. Iniciar los Servidores

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # o venv\Scripts\activate en Windows
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Ahora puedes acceder a:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Admin Django:** http://localhost:8000/admin

## 👥 Usuarios del Sistema

### Director (Administrador)
- Gestionar estudiantes
- Generar carnets
- Configurar horarios
- Ver estadísticas completas
- Descargar reportes

### Auxiliar (Operador)
- Escanear códigos de barras
- Ver asistencias del día
- Búsqueda manual de estudiantes

## 📦 Scripts Útiles

### Backup de Base de Datos

```bash
# Ejecutar backup manual
./backend/scripts/backup.sh

# Configurar backup automático (crontab)
crontab -e
# Agregar:
0 23 * * * /path/to/backend/scripts/backup.sh
```

### Limpiar Datos Antiguos

```bash
cd backend
python manage.py cleanup_old_data
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- JWT para autenticación
- CORS configurado
- Input sanitization
- Rate limiting

## 📚 Documentación

Para documentación completa del sistema, ver:
- [SISTEMA_ASISTENCIA_IES.md](./SISTEMA_ASISTENCIA_IES.md) - Especificaciones técnicas completas
- [backend/README.md](./backend/README.md) - Documentación del backend
- [frontend/README.md](./frontend/README.md) - Documentación del frontend

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Reiniciar servicio
sudo systemctl restart postgresql
```

### Error de WebSocket
- Verificar que CORS_ALLOWED_ORIGINS incluya la URL del frontend
- Verificar configuración de Channels en settings.py

### Error al generar carnets
- Verificar que Pillow esté instalado correctamente
- Verificar permisos de escritura en carpeta media/

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📧 Contacto

Para soporte técnico o consultas, contactar al equipo de desarrollo.

---

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Institución:** IES Túpac Amaru
