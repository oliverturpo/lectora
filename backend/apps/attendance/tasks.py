"""
Tareas automáticas para asistencia
"""
from django.utils import timezone
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def is_working_day():
    """Verifica si hoy es día laborable según la configuración"""
    from .utils import get_system_config

    config = get_system_config()
    working_days = config.get('working_days', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])

    # Obtener el día de la semana en inglés
    day_names = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    today_name = day_names[timezone.localdate().weekday()]

    return today_name in working_days


def auto_open_session():
    """
    Abre la sesión automáticamente a la hora configurada.
    Se ejecuta mediante el scheduler.
    """
    from .models import DailySession
    from .utils import get_attendance_times
    from apps.students.models import Student

    if not is_working_day():
        logger.info("Hoy no es día laborable. No se abre sesión.")
        return

    today = timezone.localdate()

    # Verificar si ya existe sesión
    existing = DailySession.objects.filter(date=today).first()
    if existing:
        logger.info(f"Ya existe sesión para hoy: {existing}")
        return

    # Crear nueva sesión
    times = get_attendance_times()
    session = DailySession.objects.create(
        date=today,
        scheduled_open_time=times['open_time'],
        punctuality_limit=times['punctuality_limit'],
        scheduled_close_time=times['close_time'],
        status='open',
        actual_open_time=timezone.now(),
        total_students=Student.objects.filter(is_active=True).count()
    )

    logger.info(f"Sesión abierta automáticamente: {session}")
    print(f"[SCHEDULER] Sesión abierta automáticamente para {today}")


def auto_close_session():
    """
    Cierra la sesión automáticamente y marca ausentes.
    Se ejecuta mediante el scheduler a la hora de cierre.
    """
    from .models import DailySession, Attendance
    from apps.students.models import Student

    if not is_working_day():
        logger.info("Hoy no es día laborable. No se cierra sesión.")
        return

    today = timezone.localdate()
    session = DailySession.objects.filter(date=today, status='open').first()

    if not session:
        logger.info("No hay sesión abierta para cerrar hoy.")
        return

    # Obtener estudiantes que ya registraron asistencia
    registered_student_ids = Attendance.objects.filter(
        session=session
    ).values_list('student_id', flat=True)

    # Obtener estudiantes activos que NO registraron (ausentes)
    absent_students = Student.objects.filter(
        is_active=True
    ).exclude(id__in=registered_student_ids)

    # Crear registros de falta para los ausentes
    absent_count = 0
    for student in absent_students:
        Attendance.objects.create(
            student=student,
            session=session,
            scan_timestamp=timezone.now(),
            status='absent',
            registration_method='automatic'
        )
        absent_count += 1

    # Actualizar sesión
    session.total_absent = absent_count
    session.status = 'closed'
    session.actual_close_time = timezone.now()
    session.save()

    logger.info(f"Sesión cerrada automáticamente. {absent_count} ausentes registrados.")
    print(f"[SCHEDULER] Sesión cerrada automáticamente. Presentes: {session.total_present}, Tardanzas: {session.total_late}, Ausentes: {absent_count}")


def get_scheduled_times():
    """
    Obtiene los horarios configurados para las tareas programadas.
    Retorna tuplas (hora, minuto) para cada tarea.
    """
    from .utils import get_system_config

    config = get_system_config()

    # Parsear horarios
    open_time = datetime.strptime(config['open_time'], '%H:%M')
    close_time = datetime.strptime(config['close_time'], '%H:%M')

    return {
        'open': (open_time.hour, open_time.minute),
        'close': (close_time.hour, close_time.minute),
    }
