# Sistema de Control de Asistencia Escolar

> Control de asistencia automatizado para educacion secundaria con escaneo de codigos de barras

---

## 1. ¿Que hace el sistema?

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ESTUDIANTE          AUXILIAR              DIRECTOR            │
│       │                  │                     │                │
│       ▼                  ▼                     ▼                │
│   ┌───────┐         ┌─────────┐          ┌─────────┐           │
│   │CARNET │ ──────► │ ESCANER │ ──────►  │REPORTES │           │
│   │BARRAS │         │   APP   │          │  PDF    │           │
│   └───────┘         └─────────┘          │  EXCEL  │           │
│                          │               └─────────┘           │
│                          ▼                                      │
│                    ┌───────────┐                               │
│                    │ REGISTRO  │                               │
│                    │ PRESENTE  │                               │
│                    │ TARDANZA  │                               │
│                    │  FALTA    │                               │
│                    └───────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**En resumen:**
- El estudiante muestra su carnet con codigo de barras
- El auxiliar escanea con la camara del celular o laptop
- El sistema registra automaticamente si llego a tiempo o tarde
- El director descarga reportes cuando los necesite

---

## 2. ¿Como funciona el dia a dia?

```
    HORARIO TIPICO

    07:00 ─┬─────────────────────────────────────────────
           │  Sistema se abre automaticamente
    07:30 ─┤
           │  ✓ PRESENTE - Estudiantes puntuales
    08:00 ─┤
           │  ⏱ TARDANZA - Estudiantes que llegan tarde
    12:00 ─┤
           │  ✗ FALTA - Sistema cierra y marca ausentes
    12:01 ─┴─────────────────────────────────────────────
```

**El sistema hace todo automatico:**
- Abre la sesion a la hora configurada
- Determina si es PRESENTE o TARDANZA segun la hora
- Cierra y marca las FALTAS automaticamente
- Guarda todo para los reportes

---

## 3. ¿Quien puede hacer que?

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                         DIRECTOR                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ✓ Todo lo del auxiliar                                  │ │
│  │  ✓ Agregar/editar estudiantes                            │ │
│  │  ✓ Descargar reportes PDF y Excel                        │ │
│  │  ✓ Corregir asistencias de cualquier dia                 │ │
│  │  ✓ Configurar horarios                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│                         AUXILIAR                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ✓ Escanear asistencia                                   │ │
│  │  ✓ Corregir tardanzas a presente (solo hoy)              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. ¿Que reportes genera?

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  REPORTE DIARIO │    │  REPORTE POR    │    │    NOMINAS      │
│                 │    │     GRADO       │    │                 │
│  - Fecha        │    │                 │    │  - Por grado    │
│  - Presentes    │    │  - 1ro A, B, C  │    │  - Oficiales    │
│  - Tardanzas    │    │  - 2do A, B, C  │    │  - Con fotos    │
│  - Faltas       │    │  - etc...       │    │                 │
│                 │    │                 │    │                 │
│   📄 PDF        │    │   📊 EXCEL      │    │   📄 PDF/EXCEL  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 5. ¿Como se conectan los dispositivos?

```
                    ┌─────────────────┐
                    │     ROUTER      │
                    │   (WiFi Local)  │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │   LAPTOP    │   │  CELULAR 1  │   │  CELULAR 2  │
    │  SERVIDOR   │   │  AUXILIAR   │   │  AUXILIAR   │
    │             │   │             │   │             │
    │ - Backend   │   │ - Escanea   │   │ - Escanea   │
    │ - Frontend  │   │ - Ve lista  │   │ - Ve lista  │
    │ - Base datos│   │             │   │             │
    └─────────────┘   └─────────────┘   └─────────────┘

    ✓ NO necesita internet
    ✓ Todos ven los cambios al instante
    ✓ Funciona con cualquier router WiFi
```

---

## Inicio Rapido

**Para el auxiliar:**
1. Conectarse al WiFi del colegio
2. Abrir el navegador
3. Ir a la direccion del sistema
4. Iniciar sesion
5. Escanear carnets

**Para el director:**
1. Mismo proceso que el auxiliar
2. Acceso adicional a: Estudiantes, Reportes, Configuracion

---

## Configuracion de Horarios

El director puede cambiar:

| Configuracion | Ejemplo | Descripcion |
|---------------|---------|-------------|
| Hora apertura | 07:00 | Cuando empieza a registrar |
| Limite puntualidad | 08:00 | Hasta que hora es "presente" |
| Hora cierre | 12:00 | Cuando cierra y marca faltas |
| Dias laborables | Lun-Vie | Que dias funciona |

---

## Soporte

Sistema desarrollado para el control eficiente de asistencia escolar.
Funciona sin conexion a internet, solo necesita red WiFi local.
