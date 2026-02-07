# 🪟 Setup Backend en Windows con Git Bash

## ✅ Pasos Rápidos para Windows

### 1. Crear entorno virtual

Abre Git Bash en la carpeta `backend` y ejecuta:

```bash
python -m venv venv
```

### 2. Activar entorno virtual

**En Git Bash:**
```bash
source venv/Scripts/activate
```

**En CMD o PowerShell:**
```cmd
venv\Scripts\activate
```

### 3. Actualizar pip

```bash
python -m pip install --upgrade pip
```

### 4. Instalar dependencias

```bash
pip install -r requirements.txt
```

**NOTA:** El `requirements.txt` está optimizado para Windows y NO incluye PostgreSQL. Usa SQLite por defecto.

### 5. Ejecutar migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Crear superusuario

```bash
python manage.py createsuperuser
```

Sigue las instrucciones en pantalla.

### 7. Iniciar servidor

```bash
python manage.py runserver
```

## ✅ Verificar que funcione

Abre tu navegador en:
- **Admin:** http://localhost:8000/admin/
- **API:** http://localhost:8000/api/

## 🗄️ Base de Datos

Por defecto usa **SQLite** (archivo `db.sqlite3`), perfecto para desarrollo en Windows.

Si necesitas PostgreSQL:
1. Instala PostgreSQL para Windows
2. Instala el driver: `pip install psycopg2-binary`
3. Cambia en `.env`: `DB_ENGINE=postgresql`
4. Configura las credenciales en `.env`

## 🐛 Solución de Problemas

### Error: "pip no se reconoce"
```bash
python -m pip install -r requirements.txt
```

### Error al instalar Pillow
```bash
pip install Pillow --upgrade
```

### Error con daphne
```bash
pip install daphne --no-cache-dir
```

### El servidor no inicia
1. Verifica que el entorno virtual esté activado (debe aparecer `(venv)` en la terminal)
2. Verifica que todas las dependencias se instalaron: `pip list`
3. Revisa errores: `python manage.py check`

## 📝 Comandos Útiles en Git Bash

```bash
# Activar entorno virtual
source venv/Scripts/activate

# Desactivar entorno virtual
deactivate

# Ver dependencias instaladas
pip list

# Ver migraciones
python manage.py showmigrations

# Shell de Django
python manage.py shell

# Crear app nueva
python manage.py startapp nombre_app
```

## 🔧 Tips para Git Bash en Windows

1. **Usar rutas Unix:** `/c/Users/...` en lugar de `C:\Users\...`
2. **Comandos Python:** Siempre usa `python` (no `python3`)
3. **Activar venv:** `source venv/Scripts/activate` (no `activate`)

## ✨ Todo listo!

El backend está configurado para funcionar perfectamente en Windows con SQLite.
No necesitas instalar PostgreSQL ni nada adicional.

