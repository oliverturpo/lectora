from django.apps import AppConfig


class AttendanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.attendance'
    verbose_name = 'Asistencia'

    def ready(self):
        """
        Se ejecuta cuando Django inicia.
        Aquí iniciamos el scheduler para el cierre automático.
        """
        # Importar el scheduler
        from . import scheduler
        # Iniciar el scheduler
        scheduler.start()
