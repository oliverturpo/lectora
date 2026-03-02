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


def open_pending_session():
    """
    Abre la sesión del día si estamos dentro del horario de asistencia
    y no existe sesión aún. Útil cuando el servidor se enciende tarde.
    """
    from .models import DailySession
    from .utils import get_attendance_times
    from apps.students.models import Student

    if not is_working_day():
        return None

    today = timezone.localdate()
    now = timezone.localtime().time()
    times = get_attendance_times()

    # Verificar si estamos dentro del horario de asistencia
    if now < times['open_time'] or now > times['close_time']:
        return None

    # Verificar si ya existe sesión
    existing = DailySession.objects.filter(date=today).first()
    if existing:
        return existing

    # Crear sesión (el servidor se encendió tarde pero estamos en horario)
    session = DailySession.objects.create(
        date=today,
        scheduled_open_time=times['open_time'],
        punctuality_limit=times['punctuality_limit'],
        scheduled_close_time=times['close_time'],
        status='open',
        actual_open_time=timezone.now(),
        total_students=Student.objects.filter(is_active=True).count()
    )

    logger.info(f"Sesión abierta (servidor encendido tarde): {session}")
    print(f"[SCHEDULER] Sesión abierta para {today} (servidor inició a las {now.strftime('%H:%M')})")

    return session


def close_expired_sessions():
    """
    Cierra todas las sesiones vencidas que quedaron abiertas.
    Útil cuando el servidor no estaba activo a la hora de cierre.
    Se ejecuta al iniciar el servidor y periódicamente.
    """
    from .models import DailySession, Attendance
    from .utils import get_attendance_times
    from apps.students.models import Student

    today = timezone.localdate()
    now = timezone.localtime().time()
    times = get_attendance_times()

    # Buscar sesiones abiertas que deberían estar cerradas:
    # 1. Todas las sesiones de días anteriores
    # 2. La sesión de hoy si ya pasó la hora de cierre
    open_sessions = DailySession.objects.filter(status='open')

    closed_count = 0
    for session in open_sessions:
        should_close = False

        if session.date < today:
            # Sesión de día anterior - siempre cerrar
            should_close = True
        elif session.date == today and now > times['close_time']:
            # Sesión de hoy y ya pasó la hora de cierre
            should_close = True

        if should_close:
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

            closed_count += 1
            logger.info(f"Sesión {session.date} cerrada automáticamente (vencida). {absent_count} ausentes.")
            print(f"[SCHEDULER] Sesión vencida {session.date} cerrada. Ausentes: {absent_count}")

    if closed_count > 0:
        print(f"[SCHEDULER] Se cerraron {closed_count} sesiones vencidas")

    return closed_count
