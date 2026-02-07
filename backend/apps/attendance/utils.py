"""
Utilidades para el módulo de asistencia
"""
import json
from datetime import datetime


# Configuración por defecto
DEFAULT_CONFIG = {
    'open_time': '07:30',
    'punctuality_limit': '07:45',
    'close_time': '08:00',
    'working_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    'institution_name': 'IES Tupac Amaru',
}


def get_system_config():
    """
    Obtiene la configuración del sistema desde la base de datos.
    Si no existe, retorna los valores por defecto.
    """
    from .models import SystemConfig

    config = {}
    for key, default_value in DEFAULT_CONFIG.items():
        try:
            db_config = SystemConfig.objects.get(config_key=key)
            if key == 'working_days':
                config[key] = json.loads(db_config.config_value)
            else:
                config[key] = db_config.config_value
        except SystemConfig.DoesNotExist:
            config[key] = default_value

    return config


def get_attendance_times():
    """
    Obtiene los horarios de asistencia como objetos time.
    Retorna un diccionario con open_time, punctuality_limit, close_time
    """
    config = get_system_config()

    return {
        'open_time': datetime.strptime(config['open_time'], '%H:%M').time(),
        'punctuality_limit': datetime.strptime(config['punctuality_limit'], '%H:%M').time(),
        'close_time': datetime.strptime(config['close_time'], '%H:%M').time(),
    }
