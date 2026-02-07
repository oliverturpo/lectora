# SISTEMA DE ASISTENCIA - IES TÚPAC AMARU

## 📋 INFORMACIÓN GENERAL

**Institución:** IES Túpac Amaru  
**Tipo:** Sistema de control de asistencia escolar  
**Usuarios finales:** Director + 2-3 Auxiliares  
**Estudiantes:** ~200 (1ro a 5to secundaria)  
**Objetivo:** Control automático de asistencia en la entrada del colegio

---

## 🎯 DESCRIPCIÓN DEL SISTEMA

### Funcionalidad Principal
Sistema para registrar asistencia diaria de estudiantes mediante escaneo de códigos de barras en carnets. El sistema funciona con múltiples laptops sincronizadas en tiempo real vía WebSockets.

### Características Clave
- ✅ Registro masivo de estudiantes
- ✅ Generación automática de carnets con código de barras
- ✅ Escaneo de asistencia en tiempo real
- ✅ Sincronización entre 2-3 laptops (WebSockets)
- ✅ Cierre automático del sistema
- ✅ Generación automática de reportes
- ✅ Estadísticas en tiempo real

---

## 👥 PERFILES DE USUARIO

### 1. Director (Administrador)
**Permisos:**
- Registrar/editar estudiantes
- Generar carnets
- Configurar horarios del sistema
- Ver estadísticas completas
- Descargar reportes
- Marcar asistencia manualmente (casos especiales)
- Abrir/cerrar sesiones manualmente (override)

### 2. Auxiliar (Operador)
**Permisos:**
- Ver pantalla de escaneo
- Escanear códigos de barras
- Ver lista de asistencias del día
- Ver contador en tiempo real
- Búsqueda manual de estudiante (si olvida carnet)

**NO puede:**
- Modificar configuraciones
- Descargar reportes
- Ver estadísticas históricas
- Editar estudiantes

---

## 📊 ESTRUCTURA DE DATOS

### Estudiantes
```
- ID (auto)
- DNI (único, 8 dígitos)
- Nombres
- Apellido Paterno
- Apellido Materno
- Grado (1ro, 2do, 3ro, 4to, 5to)
- Sección (A, B, C, etc.)
- Foto (imagen)
- Código de barras (generado automáticamente basado en DNI)
- Fecha de registro
- Estado (activo/inactivo)
```

### Usuarios (Sistema)
```
- ID (auto)
- Username
- Password (hash)
- Rol (director/auxiliar)
- Nombre completo
- Fecha creación
```

### Sesiones Diarias
```
- ID (auto)
- Fecha
- Hora apertura configurada (ej: 7:30 AM)
- Hora límite puntualidad (ej: 7:45 AM)
- Hora cierre automático (ej: 8:00 AM)
- Estado (abierta/cerrada)
- Total estudiantes
- Total presentes
- Total tardanzas
- Total faltas
```

### Asistencias
```
- ID (auto)
- ID Estudiante (FK)
- ID Sesión (FK)
- Timestamp (hora exacta de escaneo)
- Estado (presente/tardanza/falta)
- Laptop ID (identificador de qué laptop escaneó)
- Forma de registro (escáner/manual)
```

---

## 🔄 FLUJOS DEL SISTEMA

### FLUJO 1: Registro Inicial de Estudiantes (Una vez al año)

**Paso 1 - Registro Individual:**
```
Director → Login → 
Panel Admin → "Registrar Estudiante" →
Formulario:
  - DNI
  - Nombres completos
  - Grado y Sección
  - Capturar/subir foto →
Sistema valida →
Guarda en BD →
Genera código de barras automáticamente
```

**Paso 2 - Generación de Carnets:**
```
Director → Panel Admin → "Generar Carnets" →
Opciones:
  - Por grado completo (ej: todos de 3ro)
  - Por sección (ej: 3ro A)
  - Individual →
Sistema genera PDF con diseño:
  - Logo IES Túpac Amaru
  - Foto del estudiante
  - Datos personales
  - Código de barras
  - Formato listo para imprenta →
Descarga PDF → Enviar a imprimir
```

**Ejemplo de nombres de archivos generados:**
- `Carnets_1roA.pdf` (todos los de 1ro A)
- `Carnets_3roB.pdf` (todos los de 3ro B)
- `Carnet_Individual_72345678_JuanPerez.pdf`

---

### FLUJO 2: Toma de Asistencia Diaria

**Horario Configurado (ejemplo):**
- Apertura: 7:30 AM
- Límite puntualidad: 7:45 AM (después = tardanza)
- Cierre automático: 8:00 AM

**Paso 1 - Apertura Automática (7:30 AM):**
```
Sistema verifica hora actual →
Si es 7:30 AM →
Abre sesión automáticamente →
Crea registro de sesión en BD →
Laptops muestran pantalla activa:
  "SISTEMA ACTIVO - ESCANEAR CARNETS"
```

**Paso 2 - Escaneo de Estudiantes (7:30 - 8:00 AM):**
```
Estudiante llega →
Muestra carnet →
Auxiliar escanea con DATALOGIC →
DATALOGIC lee código (simula escritura de teclado) →
Frontend captura DNI →
Envía por WebSocket al Backend →

Backend valida:
  ✓ ¿DNI existe?
  ✓ ¿Ya escaneó hoy?
  ✓ ¿Sesión activa?
  ✓ ¿Es tardanza? (hora > 7:45 AM) →

Registra en BD →
Responde a TODAS las laptops vía WebSocket →

TODAS las laptops muestran:
  - Notificación visual (verde/amarillo)
  - Sonido de confirmación
  - Actualiza contador
  - Agrega a lista de últimos escaneos
```

**Paso 3 - Cierre Automático (8:00 AM):**
```
Sistema verifica hora →
Si es 8:00 AM →
Cierra sesión automáticamente →
Marca FALTA a todos los que no escanearon →
Genera reportes automáticamente →
Guarda en carpeta de reportes →
Notifica a Director que reportes están listos
```

---

### FLUJO 3: Generación de Reportes

**Reportes Automáticos (al cerrar sesión):**

**1. Reportes por Salón (Excel):**
```
Archivo: 1roA_15Ene2026.xlsx
Contenido:
  Apellido Paterno | Apellido Materno | Nombres | DNI | Estado | Hora
  ----------------+------------------+---------+-----+--------+-------
  Pérez           | López            | Juan    | 123 | Presente | 7:35
  Ramos           | Silva            | Ana     | 456 | Tardanza | 7:46
  Torres          | García           | Luis    | 789 | Falta    | -
```

**2. Reporte de Tardanzas Global (Excel):**
```
Archivo: Tardanzas_15Ene2026.xlsx
Todos los estudiantes que llegaron tarde de todos los grados
```

**3. Reporte de Faltas Global (Excel):**
```
Archivo: Faltas_15Ene2026.xlsx
Todos los estudiantes ausentes de todos los grados
```

**4. Resumen General (PDF):**
```
Archivo: Resumen_General_15Ene2026.pdf
- Total estudiantes: 200
- Presentes: 150 (75%)
- Tardanzas: 8 (4%)
- Faltas: 42 (21%)
- Gráfico por grados
- Tabla comparativa
```

---

## 💻 INTERFACES DEL SISTEMA

### 1. Pantalla de Login
```
┌────────────────────────────────┐
│                                │
│    [LOGO IES TÚPAC AMARU]      │
│                                │
│  Sistema de Asistencia         │
│                                │
│  Usuario: [____________]       │
│  Password: [____________]      │
│                                │
│        [INGRESAR]              │
│                                │
└────────────────────────────────┘
```

---

### 2. Dashboard Director

**Vista Principal:**
```
┌─────────────────────────────────────────────────────────┐
│  IES TÚPAC AMARU - Panel Director          [Cerrar Sesión]
├─────────────────────────────────────────────────────────┤
│  📅 Fecha: Lunes 15 Enero 2026                          │
│  ⏰ Estado Sistema: CERRADO (última sesión: 8:00 AM)    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 ESTADÍSTICAS DEL DÍA                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Total: 200  ✅ 150 (75%)  ⚠️ 8 (4%)  ❌ 42 (21%) │  │
│  │  ████████████████████████░░░░░░░░░░ 75%          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  POR GRADO:                                             │
│  1ro: 38/40 (95%)  ████████████████░░                   │
│  2do: 36/40 (90%)  ███████████████░░░                   │
│  3ro: 30/40 (75%)  ████████████░░░░░                    │
│  4to: 28/40 (70%)  ███████████░░░░░░                    │
│  5to: 18/40 (45%)  ███████░░░░░░░░░░                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  ACCIONES RÁPIDAS:                                      │
│                                                          │
│  [Gestionar Estudiantes]  [Generar Carnets]             │
│  [Ver Reportes]           [Configuración]               │
│  [Abrir Sesión Manual]                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Gestión de Estudiantes:**
```
┌─────────────────────────────────────────────────────────┐
│  Estudiantes Registrados                    [+ Nuevo]    │
├─────────────────────────────────────────────────────────┤
│  Buscar: [____________]  Grado: [Todos▾]  Sección: [▾]  │
├─────────────────────────────────────────────────────────┤
│  Foto  │ DNI      │ Apellidos y Nombres    │ Grado│Acc  │
│  [📷]  │ 72345678 │ Pérez López, Juan      │ 3ro A│[✏️][🗑]│
│  [📷]  │ 72345679 │ Ramos Silva, Ana       │ 2do B│[✏️][🗑]│
│  [📷]  │ 72345680 │ Torres García, Luis    │ 5to A│[✏️][🗑]│
│  ...                                                     │
└─────────────────────────────────────────────────────────┘

[Generar Carnets Seleccionados] [Exportar Lista]
```

---

### 3. Pantalla de Escaneo (Auxiliares)

**Modo Activo:**
```
┌─────────────────────────────────────────────────────────┐
│  IES TÚPAC AMARU - ASISTENCIA            [Cerrar Sesión]│
│  📅 Lunes 15 Enero 2026                                 │
│  ⏰ Cierre automático en: 15:23 minutos                 │
│  🟢 SISTEMA ACTIVO - ESCANEAR CARNETS                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              CONTADORES EN TIEMPO REAL                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │    ✅ PRESENTES:  150 / 200  (75%)               │  │
│  │    ⚠️  TARDANZAS:   8        (4%)                │  │
│  │    ❌ FALTAS:      42        (21%)               │  │
│  │                                                   │  │
│  │    ████████████████████████░░░░░░░░░░            │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  ÚLTIMOS ESCANEOS:                                      │
│                                                          │
│  🟢 07:35:12 - PÉREZ LÓPEZ, Juan - 3ro A - PRESENTE    │
│  🟢 07:36:45 - RAMOS SILVA, Ana - 2do B - PRESENTE     │
│  🟡 07:46:23 - TORRES GARCÍA, Luis - 5to A - TARDANZA  │
│  🟢 07:37:01 - LÓPEZ MAMANI, María - 1ro C - PRESENTE  │
│  🟢 07:38:15 - QUISPE APAZA, Pedro - 4to B - PRESENTE  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│           [CAMPO DE ESCANEO ACTIVO]                     │
│                                                          │
│        Esperando escaneo de código...                   │
│                                                          │
└─────────────────────────────────────────────────────────┘

[Búsqueda Manual] (por si olvidan carnet)
```

**Notificación de Escaneo Exitoso:**
```
┌────────────────────────────────┐
│  ✅ ASISTENCIA REGISTRADA      │
│                                │
│     [FOTO]                     │
│                                │
│  Juan Carlos Pérez López       │
│  3ro "A"                       │
│  DNI: 72345678                 │
│  Hora: 7:35:12 AM              │
│  Estado: PRESENTE              │
│                                │
│  (Se cierra automático en 2s)  │
└────────────────────────────────┘
```

**Notificación de Tardanza:**
```
┌────────────────────────────────┐
│  ⚠️  TARDANZA REGISTRADA       │
│                                │
│     [FOTO]                     │
│                                │
│  Luis Antonio Torres García    │
│  5to "A"                       │
│  DNI: 72345680                 │
│  Hora: 7:46:23 AM              │
│  Estado: TARDANZA              │
│                                │
│  (Límite era 7:45 AM)          │
└────────────────────────────────┘
```

**Notificación de Error:**
```
┌────────────────────────────────┐
│  ❌ ERROR                      │
│                                │
│  DNI: 72345999                 │
│                                │
│  El estudiante ya registró     │
│  asistencia hoy a las 7:32 AM  │
│                                │
│  [ACEPTAR]                     │
└────────────────────────────────┘
```

**Modo Inactivo (antes o después de horario):**
```
┌─────────────────────────────────────────────────────────┐
│  IES TÚPAC AMARU - ASISTENCIA                           │
│  🔴 SISTEMA INACTIVO                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              Sistema cerrado                             │
│                                                          │
│  Última sesión: 15 Enero 2026                           │
│  Horario: 7:30 AM - 8:00 AM                             │
│                                                          │
│  Próxima apertura: 16 Enero 2026 a las 7:30 AM         │
│                                                          │
│  Resultados de última sesión:                           │
│  - Presentes: 150                                       │
│  - Tardanzas: 8                                         │
│  - Faltas: 42                                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Configuración del Sistema (Director)

```
┌─────────────────────────────────────────────────────────┐
│  Configuración del Sistema                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  HORARIOS DE ASISTENCIA:                                │
│  Hora de apertura:        [07:30] AM                    │
│  Límite de puntualidad:   [07:45] AM                    │
│  Hora de cierre:          [08:00] AM                    │
│                                                          │
│  DÍAS LABORABLES:                                       │
│  ☑ Lunes  ☑ Martes  ☑ Miércoles  ☑ Jueves  ☑ Viernes  │
│  ☐ Sábado  ☐ Domingo                                    │
│                                                          │
│  GRADOS Y SECCIONES:                                    │
│  1ro Secundaria: A, B, C                                │
│  2do Secundaria: A, B                                   │
│  3ro Secundaria: A, B, C                                │
│  4to Secundaria: A, B                                   │
│  5to Secundaria: A, B                                   │
│                                      [Editar]            │
│                                                          │
│  DATOS DE LA INSTITUCIÓN:                               │
│  Nombre: IES Túpac Amaru                                │
│  Logo: [imagen.png]                  [Cambiar]          │
│                                                          │
│  [GUARDAR CAMBIOS]                   [CANCELAR]         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 5. Descarga de Reportes (Director)

```
┌─────────────────────────────────────────────────────────┐
│  Reportes de Asistencia                                 │
├─────────────────────────────────────────────────────────┤
│  Filtros:                                               │
│  Fecha: [15/01/2026]  Grado: [Todos▾]  Sección: [▾]    │
│                                                          │
│  [BUSCAR]                                               │
├─────────────────────────────────────────────────────────┤
│  Resultados del 15 Enero 2026:                          │
│                                                          │
│  📄 Resumen_General_15Ene2026.pdf        [Descargar]    │
│  📄 Estadisticas_15Ene2026.xlsx          [Descargar]    │
│                                                          │
│  POR SALÓN:                                             │
│  📄 1roA_15Ene2026.xlsx                  [Descargar]    │
│  📄 1roB_15Ene2026.xlsx                  [Descargar]    │
│  📄 2roA_15Ene2026.xlsx                  [Descargar]    │
│  📄 3roA_15Ene2026.xlsx                  [Descargar]    │
│  ...                                                     │
│                                                          │
│  REPORTES ESPECIALES:                                   │
│  📄 Tardanzas_15Ene2026.xlsx             [Descargar]    │
│  📄 Faltas_15Ene2026.xlsx                [Descargar]    │
│                                                          │
│  [DESCARGAR TODOS]                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 DISEÑO DEL CARNET

### Especificaciones
- **Tamaño:** 8.5 x 5.5 cm (tamaño estándar de carnet)
- **Orientación:** Vertical
- **Material:** Cartulina o PVC (recomendado)
- **Impresión:** A color

### Layout del Carnet

```
┌─────────────────────────────────┐
│ [LOGO]  IES TÚPAC AMARU         │
│ ═══════════════════════════════ │
│                                 │
│  ┌────────────┐                 │
│  │            │                 │
│  │    FOTO    │  Juan Carlos    │
│  │    3x4cm   │  PÉREZ LÓPEZ    │
│  │            │                 │
│  └────────────┘                 │
│                                 │
│  DNI: 72345678                  │
│  Grado: 3ro "A"                 │
│  Año Lectivo: 2026              │
│                                 │
│  ╔═══════════════════════════╗  │
│  ║ ║║║ ║ ║║║║ ║ ║║║ ║║║║    ║  │
│  ║     72345678               ║  │
│  ╚═══════════════════════════╝  │
│                                 │
│  www.iestupacamaru.edu.pe       │
└─────────────────────────────────┘
```

### Elementos del Carnet

1. **Header:**
   - Logo de la institución (izquierda)
   - Nombre "IES TÚPAC AMARU" (derecha)
   - Línea separadora

2. **Sección de Identidad:**
   - Foto 3x4 cm del estudiante (izquierda)
   - Nombres completos (derecha)
   - DNI
   - Grado y sección
   - Año lectivo

3. **Código de Barras:**
   - Tipo: Code128
   - Contenido: DNI del estudiante
   - Números legibles debajo del código

4. **Footer:**
   - Sitio web o contacto de la institución

### Colores Sugeridos
- **Fondo:** Blanco
- **Texto:** Negro
- **Header/Footer:** Azul institucional
- **Borde:** Azul institucional (opcional)

---

## 🔧 CONFIGURACIONES TÉCNICAS ESPECÍFICAS

### 1. Django Channels con PostgreSQL

**settings.py:**
```python
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"  # Simple, para 2-3 laptops
        # O usar: "channels_postgres.core.PostgresChannelLayer" si necesitas persistencia
    },
}
```

**¿Por qué InMemory?**
- Para 2-3 laptops es suficiente
- Más simple de configurar
- No requiere Redis
- Si el servidor se reinicia, solo pierdes conexiones WebSocket (se reconectan automáticamente)

---

### 2. Scheduler - APScheduler (Cierre Automático)

**Instalación:**
```bash
pip install apscheduler
```

**apps/attendance/scheduler.py:**
```python
from apscheduler.schedulers.background import BackgroundScheduler
from .tasks import auto_close_session

def start():
    scheduler = BackgroundScheduler()
    # Revisa cada minuto si es hora de cerrar
    scheduler.add_job(auto_close_session, 'cron', 
                      hour=8, minute=0,  # 8:00 AM
                      id='auto_close_session')
    scheduler.start()
```

**apps/attendance/tasks.py:**
```python
def auto_close_session():
    """Cierra sesión automáticamente y marca ausentes"""
    from .models import DailySession, Attendance
    from apps.students.models import Student
    from datetime import date
    
    today = date.today()
    try:
        session = DailySession.objects.get(date=today, status='open')
        
        # Marcar ausentes
        present_students = Attendance.objects.filter(
            session=session
        ).values_list('student_id', flat=True)
        
        absent_students = Student.objects.exclude(
            id__in=present_students
        ).filter(is_active=True)
        
        for student in absent_students:
            Attendance.objects.create(
                student=student,
                session=session,
                status='absent',
                registration_method='automatic'
            )
        
        # Actualizar estadísticas y cerrar
        session.status = 'closed'
        session.actual_close_time = timezone.now()
        session.total_absent = absent_students.count()
        session.save()
        
        # Generar reportes
        from apps.reports.services import generate_daily_reports
        generate_daily_reports(session)
        
    except DailySession.DoesNotExist:
        pass  # No hay sesión hoy
```

**Iniciar scheduler en apps.py:**
```python
# apps/attendance/apps.py
from django.apps import AppConfig

class AttendanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.attendance'

    def ready(self):
        from . import scheduler
        scheduler.start()
```

---

### 3. Backup y Restore (PostgreSQL)

**Backup Automático Diario:**

**scripts/backup.sh:**
```bash
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="asistencia_db"

# Crear backup
pg_dump $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Mantener solo últimos 30 días
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete

echo "Backup completado: backup_$DATE.sql"
```

**Programar con crontab:**
```bash
# Ejecutar todos los días a las 11:00 PM
0 23 * * * /path/to/scripts/backup.sh
```

**Restore:**
```bash
# Restaurar un backup específico
psql asistencia_db < backup_20260115_230000.sql
```

---

### 4. Retención de Datos Históricos

**Política recomendada:**
- **Estudiantes:** Mantener siempre (histórico completo)
- **Asistencias:** Mantener todo el año lectivo actual + 2 años anteriores
- **Sesiones:** Mantener todo el año lectivo actual + 2 años anteriores
- **Reportes generados:** Archivar y comprimir después de 1 año
- **Logs de auditoría:** Mantener 1 año

**Script de limpieza anual:**
```python
# apps/core/management/commands/cleanup_old_data.py
from django.core.management.base import BaseCommand
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Limpia datos antiguos'

    def handle(self, *args, **kwargs):
        # Calcular fecha límite (2 años atrás)
        cutoff_date = date.today() - timedelta(days=730)
        
        # Archivar (no eliminar) sesiones y asistencias antiguas
        old_sessions = DailySession.objects.filter(date__lt=cutoff_date)
        # Exportar a archivo antes de eliminar
        # ... código de exportación ...
        
        self.stdout.write('Limpieza completada')
```

---

### 5. Logs de Auditoría

**Modelo de auditoría:**
```python
# apps/core/models.py
class AuditLog(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)  # 'create', 'update', 'delete'
    model_name = models.CharField(max_length=50)  # 'Student', 'Attendance'
    object_id = models.IntegerField()
    changes = models.JSONField()  # Qué cambió
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['user', '-timestamp']),
        ]
```

**Middleware para auditoría:**
```python
# apps/core/middleware.py
class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Solo auditar POST, PUT, DELETE
        if request.method in ['POST', 'PUT', 'DELETE'] and request.user.is_authenticated:
            # Registrar acción
            AuditLog.objects.create(
                user=request.user,
                action=request.method.lower(),
                # ... más campos
            )
        
        return response
```

**Qué auditar:**
- ✅ Creación/edición/eliminación de estudiantes
- ✅ Apertura/cierre manual de sesiones
- ✅ Modificaciones de asistencia manual
- ✅ Cambios en configuración del sistema
- ✅ Login/logout de usuarios

---

### 6. Autenticación JWT Completa

**Flujo de autenticación:**

```
┌──────────┐                           ┌──────────┐
│  Cliente │                           │ Backend  │
└────┬─────┘                           └────┬─────┘
     │                                      │
     │ 1. POST /api/auth/login/            │
     │    {username, password}              │
     ├─────────────────────────────────────>│
     │                                      │
     │                         2. Valida    │
     │                            credenciales
     │                                      │
     │ 3. Retorna tokens                    │
     │    {access_token, refresh_token}     │
     │<─────────────────────────────────────┤
     │                                      │
     │ 4. Guarda tokens en localStorage     │
     │                                      │
     │ 5. GET /api/students/                │
     │    Header: Authorization: Bearer     │
     │            {access_token}            │
     ├─────────────────────────────────────>│
     │                                      │
     │                      6. Valida token │
     │                         y permisos   │
     │                                      │
     │ 7. Retorna datos                     │
     │<─────────────────────────────────────┤
     │                                      │
     │                                      │
     │ (Después de 24h)                     │
     │ 8. Token expiró - 401 Unauthorized   │
     │<─────────────────────────────────────┤
     │                                      │
     │ 9. POST /api/auth/refresh/           │
     │    {refresh_token}                   │
     ├─────────────────────────────────────>│
     │                                      │
     │ 10. Nuevo access_token               │
     │<─────────────────────────────────────┤
     │                                      │
```

**Backend - settings.py:**
```python
from datetime import timedelta

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

**Frontend - AuthContext.js:**
```javascript
const login = async (username, password) => {
    const response = await axios.post('/api/auth/login/', {
        username, password
    });
    
    const { access, refresh } = response.data;
    
    // Guardar en localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Configurar axios para usar token
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
};
```

---

### 7. Pruebas de Aceptación

**Checklist de pruebas antes de producción:**

**Registro de Estudiantes:**
- [ ] Registrar estudiante con foto
- [ ] Validar DNI único
- [ ] Generar código de barras correctamente
- [ ] Editar datos de estudiante
- [ ] Eliminar estudiante (soft delete)

**Generación de Carnets:**
- [ ] Generar carnet individual
- [ ] Generar carnets por grado
- [ ] Generar carnets por sección
- [ ] Verificar diseño del carnet
- [ ] Probar descarga de PDF

**Toma de Asistencia:**
- [ ] Escanear código - registro presente
- [ ] Escanear después del límite - tardanza
- [ ] Intentar escanear duplicado - error
- [ ] Escanear código inexistente - error
- [ ] Búsqueda manual de estudiante
- [ ] Registro manual de asistencia

**WebSockets:**
- [ ] Conectar 3 laptops simultáneas
- [ ] Escanear en Laptop 1 - se ve en todas
- [ ] Contador se actualiza en todas
- [ ] Desconectar una laptop - otras siguen
- [ ] Reconexión automática

**Cierre Automático:**
- [ ] Sistema cierra a la hora configurada
- [ ] Marca ausentes correctamente
- [ ] Genera reportes automáticamente
- [ ] Notifica a laptops conectadas

**Reportes:**
- [ ] Generar reporte por salón
- [ ] Generar reporte de tardanzas
- [ ] Generar reporte de faltas
- [ ] Descargar todos en ZIP
- [ ] Verificar datos en Excel/PDF

**Seguridad:**
- [ ] Login correcto funciona
- [ ] Login incorrecto rechaza
- [ ] Auxiliar no puede acceder a admin
- [ ] Tokens expiran correctamente
- [ ] Refresh token funciona

**Rendimiento:**
- [ ] Escaneo responde en < 1 segundo
- [ ] 200 estudiantes en 30 minutos
- [ ] 3 laptops sin lag

---

## 🔧 ESPECIFICACIONES TÉCNICAS

### Stack Tecnológico

**Backend:**
- Framework: Django 5.0
- API REST: Django REST Framework
- WebSockets: Django Channels (con backend de PostgreSQL)
- Base de datos: PostgreSQL (para todo: datos, sesiones, channels)
- Servidor ASGI: Daphne
- Scheduler: APScheduler (para cierre automático)

**Frontend:**
- Framework: React 18
- Estado global: Context API (simple)
- WebSockets: Cliente nativo WebSocket API
- HTTP Cliente: Axios
- UI/Notificaciones: React Toastify
- Routing: React Router DOM

**Generación de Códigos y Carnets:**
- Códigos de barras: python-barcode
- PDFs: ReportLab
- Procesamiento de imágenes: Pillow
- Excel: openpyxl

**Infraestructura:**
- Servidor: PC local o VPS
- Sistema operativo: Ubuntu Server o Windows
- Proxy reverso: Nginx (opcional en producción)
- Gestor de procesos: systemd o Supervisor
- Networking: LAN (red local del colegio)

---

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                   CAPA CLIENTE                      │
│                                                     │
│  [Laptop 1]    [Laptop 2]    [Laptop 3]            │
│  React App     React App     React App             │
│     ↓              ↓              ↓                 │
│     └──────────────┴──────────────┘                 │
│                    │                                │
│              WebSockets + HTTP                      │
│                    ↓                                │
├─────────────────────────────────────────────────────┤
│                 CAPA SERVIDOR                       │
│                                                     │
│        ┌─────────────────────────────┐              │
│        │     Django Application      │              │
│        │                             │              │
│        │  ┌──────────┐  ┌──────────┐│              │
│        │  │   REST   │  │ Channels ││              │
│        │  │   API    │  │WebSocket ││              │
│        │  └─────┬────┘  └────┬─────┘│              │
│        │        └────────────┘      │              │
│        │             │              │              │
│        │   ┌─────────▼────────┐    │              │
│        │   │ Business Logic   │    │              │
│        │   │ (Services/Models)│    │              │
│        │   └─────────┬────────┘    │              │
│        └─────────────┼──────────────┘              │
│                      │                             │
├──────────────────────┼─────────────────────────────┤
│            CAPA DE DATOS                           │
│                      │                             │
│        ┌─────────────▼─────────────┐               │
│        │      PostgreSQL            │               │
│        │  - Datos                   │               │
│        │  - Sesiones Django         │               │
│        │  - Channels Layer          │               │
│        │  - Logs/Auditoría          │               │
│        └──────────┬─────────────────┘               │
│                   │                                │
│        ┌──────────▼─────────┐                      │
│        │  Sistema Archivos  │                      │
│        │  - Fotos           │                      │
│        │  - Códigos barras  │                      │
│        │  - Carnets PDF     │                      │
│        │  - Reportes        │                      │
│        └────────────────────┘                      │
└─────────────────────────────────────────────────────┘
```

---

### Estructura de Directorios

**Backend (Django):**
```
backend/
├── manage.py
├── requirements.txt
├── .env
├── .gitignore
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py          # Configuración ASGI para WebSockets
│   └── wsgi.py
├── apps/
│   ├── __init__.py
│   ├── students/        # App de estudiantes
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   ├── attendance/      # App de asistencia
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── consumers.py    # WebSocket consumers
│   │   ├── routing.py      # WebSocket routing
│   │   └── tasks.py        # Tareas automáticas (cierre)
│   ├── users/           # App de usuarios
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   └── reports/         # App de reportes
│       ├── __init__.py
│       ├── services.py
│       ├── views.py
│       └── urls.py
├── core/
│   ├── __init__.py
│   ├── middleware.py
│   ├── permissions.py
│   └── utils.py
├── media/               # Archivos subidos
│   ├── students/
│   │   └── photos/
│   ├── barcodes/
│   └── carnets/
└── static/
    └── admin/
```

**Frontend (React):**
```
frontend/
├── package.json
├── .env
├── .gitignore
├── public/
│   ├── index.html
│   └── favicon.ico
└── src/
    ├── index.js
    ├── App.js
    ├── config/
    │   └── constants.js      # URLs, configuraciones
    ├── api/
    │   ├── axios.js          # Configuración Axios
    │   └── endpoints.js      # Endpoints del backend
    ├── hooks/
    │   ├── useWebSocket.js   # Hook personalizado WebSocket
    │   └── useAuth.js        # Hook de autenticación
    ├── contexts/
    │   ├── AuthContext.js
    │   └── AttendanceContext.js
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.js
    │   │   ├── Loading.js
    │   │   └── Alert.js
    │   ├── scanner/
    │   │   ├── ScannerView.js
    │   │   ├── AttendanceList.js
    │   │   └── StudentCard.js
    │   ├── students/
    │   │   ├── StudentList.js
    │   │   ├── StudentForm.js
    │   │   └── StudentCard.js
    │   └── reports/
    │       ├── ReportList.js
    │       └── Statistics.js
    ├── pages/
    │   ├── Login.js
    │   ├── Dashboard.js      # Dashboard Director
    │   ├── ScannerPage.js    # Página de escaneo
    │   ├── StudentsPage.js
    │   ├── ReportsPage.js
    │   └── ConfigPage.js
    ├── utils/
    │   ├── formatters.js
    │   └── validators.js
    └── styles/
        ├── global.css
        └── components/
```

---

### Modelo de Base de Datos

**Tabla: students**
```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(8) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    paternal_surname VARCHAR(100) NOT NULL,
    maternal_surname VARCHAR(100) NOT NULL,
    grade VARCHAR(10) NOT NULL,         -- 1ro, 2do, 3ro, 4to, 5to
    section VARCHAR(5) NOT NULL,        -- A, B, C, etc.
    photo VARCHAR(255),                 -- ruta a la foto
    barcode VARCHAR(255),               -- ruta al código generado
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_dni ON students(dni);
CREATE INDEX idx_students_grade_section ON students(grade, section);
```

**Tabla: users**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL,          -- 'director' o 'auxiliar'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);
```

**Tabla: daily_sessions**
```sql
CREATE TABLE daily_sessions (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    scheduled_open_time TIME NOT NULL,  -- 07:30:00
    punctuality_limit TIME NOT NULL,    -- 07:45:00
    scheduled_close_time TIME NOT NULL, -- 08:00:00
    actual_open_time TIMESTAMP,
    actual_close_time TIMESTAMP,
    status VARCHAR(20) NOT NULL,        -- 'pending', 'open', 'closed'
    total_students INTEGER DEFAULT 0,
    total_present INTEGER DEFAULT 0,
    total_late INTEGER DEFAULT 0,
    total_absent INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_date ON daily_sessions(date);
CREATE INDEX idx_sessions_status ON daily_sessions(status);
```

**Tabla: attendances**
```sql
CREATE TABLE attendances (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES daily_sessions(id) ON DELETE CASCADE,
    scan_timestamp TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,        -- 'present', 'late', 'absent'
    laptop_id VARCHAR(50),              -- identificador de laptop
    registration_method VARCHAR(20) NOT NULL, -- 'scanner', 'manual'
    registered_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, session_id)      -- Un estudiante solo puede tener un registro por sesión
);

CREATE INDEX idx_attendances_session ON attendances(session_id);
CREATE INDEX idx_attendances_student ON attendances(student_id);
CREATE INDEX idx_attendances_status ON attendances(status);
```

**Tabla: system_config**
```sql
CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Configuraciones iniciales
INSERT INTO system_config (config_key, config_value, description) VALUES
('open_time', '07:30', 'Hora de apertura del sistema'),
('punctuality_limit', '07:45', 'Hora límite para marcar presente sin tardanza'),
('close_time', '08:00', 'Hora de cierre automático del sistema'),
('institution_name', 'IES Túpac Amaru', 'Nombre de la institución'),
('working_days', 'monday,tuesday,wednesday,thursday,friday', 'Días laborables');
```

---

### WebSocket Protocol

**Conexión:**
```
ws://localhost:8000/ws/attendance/
```

**Mensajes del Cliente al Servidor:**

1. **Registrar asistencia (escaneo):**
```json
{
    "type": "scan_attendance",
    "dni": "72345678",
    "laptop_id": "LAPTOP_001",
    "timestamp": "2026-01-15T07:35:12Z"
}
```

2. **Ping (mantener conexión viva):**
```json
{
    "type": "ping"
}
```

**Mensajes del Servidor a TODOS los Clientes:**

1. **Asistencia registrada exitosamente:**
```json
{
    "type": "attendance_registered",
    "status": "success",
    "data": {
        "student": {
            "id": 123,
            "dni": "72345678",
            "full_name": "Juan Carlos Pérez López",
            "grade": "3ro",
            "section": "A",
            "photo_url": "/media/students/photos/72345678.jpg"
        },
        "attendance": {
            "status": "present",  // o "late"
            "scan_time": "2026-01-15T07:35:12Z",
            "laptop_id": "LAPTOP_001"
        }
    },
    "counters": {
        "total": 200,
        "present": 150,
        "late": 8,
        "absent": 42
    }
}
```

2. **Error en el registro:**
```json
{
    "type": "attendance_error",
    "status": "error",
    "error_code": "ALREADY_REGISTERED",  // o "STUDENT_NOT_FOUND", "SESSION_CLOSED"
    "message": "El estudiante ya registró asistencia hoy a las 07:32:15",
    "dni": "72345678"
}
```

3. **Actualización de contadores (periódica):**
```json
{
    "type": "counters_update",
    "counters": {
        "total": 200,
        "present": 150,
        "late": 8,
        "absent": 42,
        "percentage": 79.0
    }
}
```

4. **Sesión cerrada:**
```json
{
    "type": "session_closed",
    "message": "La sesión se ha cerrado automáticamente",
    "close_time": "2026-01-15T08:00:00Z",
    "final_stats": {
        "total": 200,
        "present": 150,
        "late": 8,
        "absent": 42
    }
}
```

5. **Pong (respuesta a ping):**
```json
{
    "type": "pong"
}
```

---

### API REST Endpoints

**Autenticación:**
```
POST   /api/auth/login/          # Login
POST   /api/auth/logout/         # Logout
GET    /api/auth/me/             # Usuario actual
```

**Estudiantes:**
```
GET    /api/students/                    # Listar todos
POST   /api/students/                    # Crear nuevo
GET    /api/students/{id}/               # Ver detalle
PUT    /api/students/{id}/               # Actualizar
DELETE /api/students/{id}/               # Eliminar
GET    /api/students/?grade=3ro          # Filtrar por grado
GET    /api/students/?section=A          # Filtrar por sección
POST   /api/students/{id}/upload-photo/  # Subir foto
```

**Carnets:**
```
POST   /api/carnets/generate/            # Generar carnets
       Body: {
           "students": [1, 2, 3],  # IDs de estudiantes
           "format": "individual"   # o "bulk"
       }
GET    /api/carnets/download/{filename}/ # Descargar PDF generado
```

**Sesiones:**
```
GET    /api/sessions/                    # Listar sesiones
GET    /api/sessions/current/            # Sesión actual (si está abierta)
POST   /api/sessions/open/               # Abrir sesión manualmente
POST   /api/sessions/close/              # Cerrar sesión manualmente
GET    /api/sessions/{id}/               # Ver detalle de sesión
```

**Asistencias:**
```
GET    /api/attendances/                     # Listar todas
GET    /api/attendances/?session_id=123     # Por sesión
GET    /api/attendances/?student_id=456     # Por estudiante
GET    /api/attendances/?status=late        # Por estado
POST   /api/attendances/manual/             # Registro manual
       Body: {
           "student_id": 123,
           "status": "present"
       }
```

**Reportes:**
```
GET    /api/reports/daily/?date=2026-01-15          # Reporte del día
GET    /api/reports/by-grade/?date=2026-01-15&grade=3ro
GET    /api/reports/by-section/?date=2026-01-15&grade=3ro&section=A
GET    /api/reports/absences/?date=2026-01-15       # Solo ausencias
GET    /api/reports/tardiness/?date=2026-01-15      # Solo tardanzas
POST   /api/reports/export/                         # Exportar reportes
       Body: {
           "date": "2026-01-15",
           "format": "excel",  // o "pdf"
           "type": "all"       // o "by_grade", "by_section"
       }
```

**Estadísticas:**
```
GET    /api/stats/today/                   # Estadísticas del día
GET    /api/stats/by-grade/                # Por grado
GET    /api/stats/student/{id}/history/    # Historial de estudiante
```

**Configuración:**
```
GET    /api/config/                        # Ver configuración
PUT    /api/config/                        # Actualizar configuración
       Body: {
           "open_time": "07:30",
           "punctuality_limit": "07:45",
           "close_time": "08:00"
       }
```

---

## ⚙️ FUNCIONALIDADES ESPECIALES

### 1. Cierre Automático de Sesión

**Proceso:**
1. Sistema tiene un scheduler (Celery o APScheduler)
2. A la hora configurada (ej: 8:00 AM):
   - Cambia estado de sesión a "closed"
   - Busca todos los estudiantes que NO tienen registro en la sesión
   - Crea registros con status="absent" para cada uno
   - Actualiza contadores de la sesión
   - Genera reportes automáticamente
   - Notifica a todas las laptops conectadas vía WebSocket

**Tecnologías:**
- **Opción 1:** Celery Beat (tareas programadas)
- **Opción 2:** APScheduler (más simple)
- **Opción 3:** Cron job que llama al API

### 2. Generación de Carnets en Lote

**Proceso:**
1. Director selecciona estudiantes (por grado, sección, o individual)
2. Sistema crea un job asíncrono
3. Por cada estudiante:
   - Lee datos de la BD
   - Genera código de barras (python-barcode)
   - Crea layout del carnet (ReportLab)
   - Inserta foto del estudiante
   - Guarda carnet individual
4. Combina todos en un PDF maestro
5. Retorna URL de descarga

**Librerías:**
- `python-barcode`: Generar códigos
- `ReportLab` o `WeasyPrint`: Crear PDFs
- `Pillow`: Manipular imágenes

### 3. Sincronización en Tiempo Real

**Funcionamiento:**
1. Laptop 1 escanea código → envía por WebSocket
2. Backend procesa y valida
3. Backend envía respuesta a TODAS las laptops conectadas
4. Todas las laptops actualizan UI simultáneamente

**Ventajas:**
- Evita duplicados (si Laptop 1 escanea, Laptop 2 y 3 ven que ya está registrado)
- Contadores actualizados en tiempo real
- Todas las laptops muestran la misma información

### 4. Manejo de Desconexiones

**Estrategias:**
1. **Heartbeat:** Ping cada 30 segundos
2. **Reconnect:** Auto-reconectar si se cae la conexión
3. **Queue local:** Guardar escaneos localmente si no hay conexión
4. **Sync:** Sincronizar cuando vuelva la conexión

### 5. Búsqueda Manual de Estudiante

**Caso de uso:** Estudiante olvida su carnet

**Flujo:**
1. Auxiliar presiona botón "Búsqueda Manual"
2. Modal con campo de búsqueda
3. Busca por nombre o DNI
4. Muestra resultados con foto
5. Auxiliar selecciona al estudiante correcto
6. Registra asistencia manualmente

### 6. Validaciones del Sistema

**Al escanear:**
- ✓ ¿El DNI existe en la base de datos?
- ✓ ¿Hay una sesión activa?
- ✓ ¿El estudiante ya registró asistencia hoy?
- ✓ ¿Es antes o después de la hora límite de puntualidad?

**Respuestas:**
- DNI no existe → Error "Estudiante no encontrado"
- Sin sesión activa → Error "Sistema cerrado"
- Ya registrado → Error "Ya registró asistencia a las XX:XX"
- Después de límite → Registra como "Tardanza"

---

## 🎯 CASOS DE USO DETALLADOS

### Caso 1: Registro de Nuevo Estudiante

**Actor:** Director

**Precondición:** Director está autenticado

**Flujo:**
1. Director accede a "Gestionar Estudiantes"
2. Presiona botón "+ Nuevo Estudiante"
3. Completa formulario:
   - DNI: 72345678
   - Nombres: Juan Carlos
   - Apellido Paterno: Pérez
   - Apellido Materno: López
   - Grado: 3ro
   - Sección: A
   - Foto: [Captura o sube imagen]
4. Presiona "Guardar"
5. Sistema valida datos
6. Guarda en BD
7. Genera código de barras automáticamente
8. Muestra confirmación: "Estudiante registrado exitosamente"

**Postcondición:** Estudiante está en el sistema y su código de barras generado

---

### Caso 2: Generación de Carnets para un Grado

**Actor:** Director

**Precondición:** Estudiantes del grado están registrados con fotos

**Flujo:**
1. Director accede a "Gestionar Estudiantes"
2. Filtra por "Grado: 3ro"
3. Selecciona todos los estudiantes de 3ro
4. Presiona "Generar Carnets"
5. Sistema muestra opciones:
   - Formato: Individual / Por sección / Todo el grado
6. Director selecciona "Todo el grado"
7. Presiona "Generar"
8. Sistema procesa (puede tardar unos segundos)
9. Muestra barra de progreso
10. Al terminar: "Carnets generados exitosamente"
11. Botón "Descargar PDF"
12. Director descarga: `Carnets_3ro_Todos.pdf`

**Postcondición:** Archivo PDF listo para enviar a imprenta

---

### Caso 3: Toma de Asistencia Normal

**Actor:** Auxiliar + Estudiante

**Precondición:** 
- Sesión está abierta (7:30 - 8:00 AM)
- Auxiliar en pantalla de escaneo
- Estudiante llega con su carnet

**Flujo:**
1. Estudiante llega a las 7:35 AM
2. Muestra su carnet al auxiliar
3. Auxiliar escanea código con DATALOGIC
4. DATALOGIC lee código y "escribe" el DNI: 72345678
5. Frontend captura el DNI
6. Envía por WebSocket: `{"type": "scan_attendance", "dni": "72345678"}`
7. Backend recibe y valida:
   - ✓ DNI existe
   - ✓ Sesión abierta
   - ✓ NO ha registrado hoy
   - ✓ Hora actual (7:35) < límite (7:45) → PRESENTE
8. Backend guarda en BD
9. Backend envía a TODAS las laptops:
```json
{
    "type": "attendance_registered",
    "status": "success",
    "data": {
        "student": {
            "full_name": "Juan Carlos Pérez López",
            "grade": "3ro A",
            "photo_url": "..."
        },
        "attendance": {
            "status": "present",
            "scan_time": "07:35:12"
        }
    }
}
```
10. TODAS las laptops muestran:
    - Notificación verde ✅
    - Sonido de confirmación
    - "Juan Carlos Pérez López - 3ro A - PRESENTE"
    - Actualiza contador: Presentes +1

**Postcondición:** Asistencia registrada, todas las laptops sincronizadas

---

### Caso 4: Registro de Tardanza

**Actor:** Auxiliar + Estudiante

**Precondición:** 
- Sesión abierta
- Hora actual > hora límite de puntualidad

**Flujo:**
1. Estudiante llega a las 7:48 AM (después de 7:45 AM)
2. Escanea su carnet
3. Sistema procesa igual que Caso 3
4. Pero en validación:
   - Hora actual (7:48) > límite (7:45) → TARDANZA
5. Backend guarda con status="late"
6. Todas las laptops muestran:
   - Notificación amarilla ⚠️
   - Sonido diferente (opcional)
   - "Luis Antonio Torres - 5to A - TARDANZA"
   - "Límite era 7:45 AM - Llegó a las 7:48 AM"
   - Actualiza contador: Tardanzas +1

**Postcondición:** Tardanza registrada

---

### Caso 5: Intento de Escaneo Duplicado

**Actor:** Auxiliar + Estudiante

**Precondición:** 
- Estudiante ya registró asistencia hoy

**Flujo:**
1. Estudiante intenta escanear nuevamente su carnet
2. Sistema valida:
   - ✓ DNI existe
   - ✓ Sesión abierta
   - ✗ YA registró asistencia hoy a las 7:35 AM
3. Backend envía error:
```json
{
    "type": "attendance_error",
    "error_code": "ALREADY_REGISTERED",
    "message": "Ya registró asistencia hoy a las 07:35:12",
    "dni": "72345678"
}
```
4. Laptop muestra:
   - Notificación roja ❌
   - "ERROR: Ya registró asistencia a las 7:35 AM"
   - Foto del estudiante (para confirmar identidad)

**Postcondición:** No se crea registro duplicado

---

### Caso 6: Cierre Automático de Sesión

**Actor:** Sistema (automático)

**Precondición:** 
- Hora actual = hora de cierre configurada (8:00 AM)
- Sesión está abierta

**Flujo:**
1. Reloj del sistema marca 8:00:00 AM
2. Scheduler detecta que es hora de cierre
3. Sistema ejecuta proceso de cierre:
   a. Cambia status de sesión a "closed"
   b. Cuenta total de registros:
      - Presentes: 150
      - Tardanzas: 8
      - Total registrados: 158
   c. Calcula ausentes: 200 - 158 = 42
   d. Busca los 42 estudiantes sin registro
   e. Crea registros automáticos con status="absent"
   f. Actualiza estadísticas de la sesión
   g. Genera reportes automáticamente:
      - Resumen general (PDF)
      - Por cada salón (Excel)
      - Solo tardanzas (Excel)
      - Solo faltas (Excel)
4. Notifica a todas las laptops:
```json
{
    "type": "session_closed",
    "message": "Sesión cerrada automáticamente",
    "final_stats": {
        "present": 150,
        "late": 8,
        "absent": 42
    }
}
```
5. Laptops muestran:
   - Pantalla cambia a "SISTEMA CERRADO"
   - Muestra estadísticas finales
   - Desactiva campo de escaneo

**Postcondición:** 
- Sesión cerrada
- Todos los ausentes marcados
- Reportes generados

---

### Caso 7: Descarga de Reportes

**Actor:** Director

**Precondición:** 
- Sesión del día está cerrada
- Reportes generados

**Flujo:**
1. Director accede a "Reportes"
2. Selecciona fecha: 15 Enero 2026
3. Sistema muestra lista de reportes disponibles:
   - Resumen_General_15Ene2026.pdf
   - Estadisticas_15Ene2026.xlsx
   - 1roA_15Ene2026.xlsx
   - 1roB_15Ene2026.xlsx
   - ...
   - Tardanzas_15Ene2026.xlsx
   - Faltas_15Ene2026.xlsx
4. Director puede:
   - Descargar uno por uno
   - O presionar "Descargar Todos" (genera ZIP)
5. Sistema comprime todos en `Reportes_15Ene2026.zip`
6. Director descarga el ZIP

**Postcondición:** Director tiene todos los reportes del día

---

### Caso 8: Estudiante Olvida su Carnet

**Actor:** Auxiliar + Estudiante

**Precondición:** 
- Sesión abierta
- Estudiante sin carnet

**Flujo:**
1. Estudiante llega sin su carnet
2. Auxiliar presiona botón "Búsqueda Manual"
3. Modal se abre con campo de búsqueda
4. Auxiliar pregunta: "¿Cuál es tu nombre?"
5. Estudiante dice: "Juan Pérez"
6. Auxiliar escribe: "Juan Pérez"
7. Sistema busca en BD (búsqueda parcial)
8. Muestra resultados:
   - Juan Carlos Pérez López - 3ro A [Foto]
   - Juan Alberto Pérez Mamani - 2do B [Foto]
9. Auxiliar pregunta: "¿Eres tú?" (muestra fotos)
10. Estudiante confirma: "Sí, soy el primero"
11. Auxiliar selecciona al correcto
12. Sistema registra asistencia normalmente
13. Marca como "registration_method: manual"

**Postcondición:** Asistencia registrada sin código de barras

---

## 🔐 SEGURIDAD

### Autenticación
- JWT tokens para API REST
- Session storage para frontend
- Tokens expiran en 24 horas
- Refresh tokens para renovar

### Autorización
- Roles: Director (admin) y Auxiliar (operador)
- Middlewares verifican permisos en cada endpoint
- Frontend oculta opciones según rol

### Validaciones
- Input sanitization en frontend y backend
- Validación de tipos de datos
- Rate limiting para prevenir spam
- CSRF tokens en formularios

### Datos Sensibles
- Contraseñas hasheadas (bcrypt)
- Fotos almacenadas en servidor seguro
- Acceso a archivos validado

---

## 🚀 DESPLIEGUE

### Opción 1: Servidor Local (Recomendado para colegio)

**Requisitos:**
- PC o laptop que actúe como servidor
- Sistema operativo: Ubuntu/Windows Server
- RAM: 4GB mínimo
- Disco: 20GB mínimo
- Red LAN del colegio

**Ventajas:**
- No depende de internet
- Más rápido (red local)
- Sin costos mensuales
- Total control

**Instalación:**
1. Instalar PostgreSQL y Redis
2. Instalar Python y Node.js
3. Clonar repositorio
4. Configurar variables de entorno
5. Ejecutar migraciones
6. Recolectar archivos estáticos
7. Configurar Nginx
8. Iniciar servicios

### Opción 2: VPS en la Nube

**Ventajas:**
- Acceso desde cualquier lugar
- Respaldos automáticos
- Escalable

**Desventajas:**
- Requiere internet estable
- Costo mensual (~$10-20/mes)

---

## 📝 TAREAS DE DESARROLLO

### Fase 1: Setup Inicial (Semana 1)
- [ ] Configurar proyecto Django
- [ ] Configurar proyecto React
- [ ] Configurar PostgreSQL
- [ ] Configurar Redis
- [ ] Crear modelos de BD
- [ ] Crear migraciones
- [ ] Setup Django Channels
- [ ] Configurar CORS

### Fase 2: Gestión de Estudiantes (Semana 1-2)
- [ ] API CRUD de estudiantes
- [ ] Formulario de registro en frontend
- [ ] Subida de fotos
- [ ] Validaciones
- [ ] Lista de estudiantes
- [ ] Búsqueda y filtros

### Fase 3: Generación de Carnets (Semana 2)
- [ ] Implementar python-barcode
- [ ] Diseñar layout de carnet
- [ ] Generar PDF individual
- [ ] Generar PDF en lote
- [ ] Endpoint de descarga
- [ ] Interfaz de generación en frontend

### Fase 4: Sistema de Asistencia (Semana 3)
- [ ] Modelo de sesiones
- [ ] Modelo de asistencias
- [ ] API para abrir/cerrar sesión
- [ ] WebSocket consumer
- [ ] Lógica de validación de escaneo
- [ ] Integración con DATALOGIC
- [ ] Pantalla de escaneo en frontend
- [ ] Sincronización en tiempo real

### Fase 5: Cierre Automático (Semana 4)
- [ ] Configurar scheduler (Celery o APScheduler)
- [ ] Tarea de cierre automático
- [ ] Marcar ausentes automáticamente
- [ ] Notificación de cierre vía WebSocket

### Fase 6: Reportes (Semana 4)
- [ ] Generador de reportes en Excel
- [ ] Generador de reportes en PDF
- [ ] API de reportes
- [ ] Interfaz de descarga en frontend
- [ ] Estadísticas en dashboard

### Fase 7: Funcionalidades Adicionales (Semana 5)
- [ ] Búsqueda manual de estudiante
- [ ] Configuración del sistema
- [ ] Histórico de asistencias
- [ ] Manejo de errores
- [ ] Notificaciones visuales/sonoras

### Fase 8: Testing y Deployment (Semana 5-6)
- [ ] Pruebas unitarias backend
- [ ] Pruebas integración WebSockets
- [ ] Pruebas en múltiples laptops
- [ ] Optimizaciones de rendimiento
- [ ] Documentación de usuario
- [ ] Deploy en servidor
- [ ] Capacitación a usuarios

---

## 📚 RECURSOS ADICIONALES

### Documentación Técnica
- Django: https://docs.djangoproject.com/
- Django Channels: https://channels.readthedocs.io/
- React: https://react.dev/
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

### Librerías Clave
- python-barcode: https://python-barcode.readthedocs.io/
- ReportLab: https://www.reportlab.com/docs/
- openpyxl: https://openpyxl.readthedocs.io/

### Tutoriales
- Django Channels Tutorial: https://channels.readthedocs.io/en/stable/tutorial/
- WebSockets con React: https://javascript.info/websocket
- Django REST Framework: https://www.django-rest-framework.org/tutorial/

---

## 📝 RESUMEN DE SIMPLIFICACIONES

Este sistema ha sido simplificado para ser más fácil de desarrollar y mantener:

### ✅ Cambios realizados:

1. **Sin Redis:**
   - Django Channels usa InMemoryChannelLayer
   - Para 2-3 laptops es más que suficiente
   - Menos dependencias = menos complejidad

2. **APScheduler para cierre automático:**
   - Simple de configurar
   - No requiere Celery ni workers adicionales
   - Perfecto para una tarea programada

3. **PostgreSQL para todo:**
   - Datos de aplicación
   - Sesiones de Django
   - Backend de Channels
   - Logs de auditoría

4. **Context API en React:**
   - No Redux (demasiado para este proyecto)
   - Más simple y directo

5. **Auditoría básica pero efectiva:**
   - Quién modificó qué y cuándo
   - No complica el sistema

### 🎯 Ventajas:

- ✅ Más fácil de desarrollar
- ✅ Menos cosas que configurar
- ✅ Menos servicios corriendo
- ✅ Más fácil de debuggear
- ✅ Funciona perfectamente para 200 estudiantes y 2-3 laptops

---

## 🎓 NOTAS FINALES

Este documento describe un sistema completo de asistencia escolar con las siguientes características principales:

✅ **Funcional:** Cubre todos los casos de uso necesarios  
✅ **Escalable:** Puede crecer a más estudiantes/laptops  
✅ **Robusto:** Maneja errores y casos especiales  
✅ **En tiempo real:** WebSockets para sincronización  
✅ **Automático:** Cierre y reportes sin intervención manual  
✅ **Fácil de usar:** Interfaces intuitivas

**Tiempo estimado de desarrollo:** 5-6 semanas con un desarrollador

**Tecnologías principales:**
- Backend: Django + Channels + PostgreSQL + Redis
- Frontend: React + WebSockets
- Hardware: DATALOGIC barcode scanner

---

## 💬 CONTACTO Y SOPORTE

Para dudas técnicas o cambios en los requerimientos, contactar al equipo de desarrollo.

**Versión del documento:** 1.0  
**Fecha:** 14 Enero 2026  
**Autor:** Sistema de Asistencia IES Túpac Amaru
