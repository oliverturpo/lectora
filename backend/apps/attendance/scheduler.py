"""
Scheduler para apertura y cierre automático de sesiones
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()
scheduler_started = False


def configure_jobs():
    """
    Configura las tareas programadas basándose en la configuración del sistema.
    """
    from .tasks import auto_open_session, auto_close_session, close_expired_sessions, get_scheduled_times
    from apscheduler.triggers.interval import IntervalTrigger

    # Eliminar jobs existentes para reconfigurar
    scheduler.remove_all_jobs()

    try:
        times = get_scheduled_times()

        # Tarea de apertura automática
        scheduler.add_job(
            auto_open_session,
            trigger=CronTrigger(
                hour=times['open']['hour'] if isinstance(times['open'], dict) else times['open'][0],
                minute=times['open']['minute'] if isinstance(times['open'], dict) else times['open'][1],
                day_of_week='mon-sun'  # La función verifica internamente si es día laborable
            ),
            id='auto_open_session',
            name='Apertura automática de sesión',
            replace_existing=True
        )

        # Tarea de cierre automático
        scheduler.add_job(
            auto_close_session,
            trigger=CronTrigger(
                hour=times['close']['hour'] if isinstance(times['close'], dict) else times['close'][0],
                minute=times['close']['minute'] if isinstance(times['close'], dict) else times['close'][1],
                day_of_week='mon-sun'  # La función verifica internamente si es día laborable
            ),
            id='auto_close_session',
            name='Cierre automático de sesión',
            replace_existing=True
        )

        # Tarea periódica para cerrar sesiones vencidas (cada 5 minutos)
        scheduler.add_job(
            close_expired_sessions,
            trigger=IntervalTrigger(minutes=5),
            id='close_expired_sessions',
            name='Cerrar sesiones vencidas',
            replace_existing=True
        )

        open_time = f"{times['open'][0]:02d}:{times['open'][1]:02d}"
        close_time = f"{times['close'][0]:02d}:{times['close'][1]:02d}"

        print(f"[SCHEDULER] Tareas programadas:")
        print(f"  - Apertura automática: {open_time}")
        print(f"  - Cierre automático: {close_time}")
        print(f"  - Verificación de sesiones vencidas: cada 5 minutos")

    except Exception as e:
        logger.error(f"Error configurando scheduler: {e}")
        print(f"[SCHEDULER] Error configurando tareas: {e}")


def start():
    """
    Inicia el scheduler en segundo plano.
    Solo debe llamarse una vez al iniciar la aplicación.
    """
    global scheduler_started
    import sys
    import os

    if scheduler_started:
        return

    # No iniciar en migraciones, tests o comandos de management
    # Solo iniciar con runserver o daphne
    is_runserver = 'runserver' in sys.argv
    is_daphne = len(sys.argv) > 0 and 'daphne' in sys.argv[0]
    is_main_process = os.environ.get('RUN_MAIN') == 'true'  # Django reloader

    # En desarrollo, solo iniciar en el proceso principal (evita duplicados)
    if not (is_runserver or is_daphne):
        return

    # Con runserver y reloader, solo iniciar en el proceso hijo
    if is_runserver and not is_main_process and '--noreload' not in sys.argv:
        return

    try:
        configure_jobs()
        scheduler.start()
        scheduler_started = True
        print("[SCHEDULER] Scheduler iniciado correctamente")

        # Al iniciar: cerrar sesiones vencidas y abrir sesión si corresponde
        from .tasks import close_expired_sessions, open_pending_session

        # Primero cerrar sesiones vencidas (de días anteriores o de hoy si ya pasó la hora)
        close_expired_sessions()

        # Luego abrir sesión de hoy si estamos en horario y no existe
        open_pending_session()

    except Exception as e:
        logger.error(f"Error iniciando scheduler: {e}")
        print(f"[SCHEDULER] Error al iniciar: {e}")


def stop():
    """
    Detiene el scheduler.
    """
    global scheduler_started

    if scheduler_started and scheduler.running:
        scheduler.shutdown()
        scheduler_started = False
        print("[SCHEDULER] Scheduler detenido")


def reload_schedule():
    """
    Recarga la configuración del scheduler.
    Útil cuando se cambian los horarios desde la configuración.
    """
    if scheduler_started:
        configure_jobs()
        print("[SCHEDULER] Configuración recargada")
