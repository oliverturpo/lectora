"""
Utilidades para el módulo de asistencia
"""
import json
from datetime import datetime
from django.conf import settings
from django.core.cache import cache

# Configuración por defecto
DEFAULT_CONFIG = {
    'open_time': '07:30',
    'punctuality_limit': '07:45',
    'close_time': '08:00',
    'working_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    'institution_name': '',
}

# Cache key para configuración del sistema
SYSTEM_CONFIG_CACHE_KEY = 'system_config'
SYSTEM_CONFIG_CACHE_TIMEOUT = 300  # 5 minutos


def get_system_config(use_cache=True):
    """
    Obtiene la configuración del sistema desde la base de datos.
    Si no existe, retorna los valores por defecto.
    OPTIMIZADO: Una sola query + cache de 5 minutos.
    """
    from .models import SystemConfig

    # Intentar obtener de cache
    if use_cache:
        cached_config = cache.get(SYSTEM_CONFIG_CACHE_KEY)
        if cached_config:
            return cached_config

    # Query única para todas las configuraciones
    db_configs = SystemConfig.objects.filter(
        config_key__in=DEFAULT_CONFIG.keys()
    ).values('config_key', 'config_value')

    # Convertir a diccionario
    db_config_dict = {c['config_key']: c['config_value'] for c in db_configs}

    # Construir configuración final
    config = {}
    for key, default_value in DEFAULT_CONFIG.items():
        if key in db_config_dict:
            value = db_config_dict[key]
            if key == 'working_days':
                config[key] = json.loads(value)
            else:
                config[key] = value
        else:
            config[key] = default_value

    # Si institution_name está vacío, usar el valor de settings como fallback
    if not config.get('institution_name'):
        config['institution_name'] = settings.INSTITUTION_CONFIG.get('NAME', 'IES')

    # Guardar en cache
    if use_cache:
        cache.set(SYSTEM_CONFIG_CACHE_KEY, config, SYSTEM_CONFIG_CACHE_TIMEOUT)

    return config


def invalidate_system_config_cache():
    """Invalida el cache de configuración del sistema."""
    cache.delete(SYSTEM_CONFIG_CACHE_KEY)


def get_attendance_times(config=None):
    """
    Obtiene los horarios de asistencia como objetos time.
    Retorna un diccionario con open_time, punctuality_limit, close_time
    OPTIMIZADO: Acepta config existente para evitar query duplicada.
    """
    if config is None:
        config = get_system_config()

    return {
        'open_time': datetime.strptime(config['open_time'], '%H:%M').time(),
        'punctuality_limit': datetime.strptime(config['punctuality_limit'], '%H:%M').time(),
        'close_time': datetime.strptime(config['close_time'], '%H:%M').time(),
    }
