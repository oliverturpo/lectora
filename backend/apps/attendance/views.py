import json
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q, Count
from .models import (
    DailySession, Attendance, SystemConfig,
    Justification, StudentJustificationCounter, Notification, NotificationRead
)
from .serializers import (
    DailySessionSerializer, AttendanceSerializer,
    JustificationSerializer, StudentJustificationStatusSerializer,
    NotificationSerializer
)
from apps.students.models import Student


class SessionViewSet(viewsets.ModelViewSet):
    """ViewSet para sesiones diarias"""
    queryset = DailySession.objects.all()
    serializer_class = DailySessionSerializer

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Obtiene la sesion del dia actual"""
        today = timezone.localdate()
        session = DailySession.objects.filter(date=today).first()
        if session:
            return Response(DailySessionSerializer(session).data)
        return Response({'detail': 'No hay sesion activa hoy'}, status=404)

    @action(detail=False, methods=['post'])
    def open(self, request):
        """Abre una nueva sesion para hoy"""
        from .utils import get_attendance_times

        today = timezone.localdate()
        existing = DailySession.objects.filter(date=today).first()
        if existing:
            return Response(
                {'detail': 'Ya existe una sesion para hoy'},
                status=status.HTTP_400_BAD_REQUEST
            )

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
        return Response(DailySessionSerializer(session).data, status=201)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Cierra una sesion"""
        session = self.get_object()
        if session.status == 'closed':
            return Response(
                {'detail': 'La sesion ya esta cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Marcar ausentes a los que no tienen registro
        registered_students = Attendance.objects.filter(session=session).values_list('student_id', flat=True)
        absent_students = Student.objects.filter(is_active=True).exclude(id__in=registered_students)

        for student in absent_students:
            Attendance.objects.create(
                student=student,
                session=session,
                scan_timestamp=timezone.now(),
                status='absent',
                registration_method='automatic'
            )

        session.total_absent = absent_students.count()
        session.status = 'closed'
        session.actual_close_time = timezone.now()
        session.save()

        return Response(DailySessionSerializer(session).data)


class AttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet para registros de asistencia"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        queryset = Attendance.objects.all()
        session_id = self.request.query_params.get('session')
        status_filter = self.request.query_params.get('status')

        if session_id:
            queryset = queryset.filter(session_id=session_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset.select_related('student', 'session').order_by('student__paternal_surname', 'student__maternal_surname')

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        Actualiza el estado de una asistencia.
        - Auxiliar: solo puede cambiar TARDANZA -> PRESENTE (del día actual)
        - Director: puede cambiar cualquier estado, cualquier día
        """
        attendance = self.get_object()
        new_status = request.data.get('status')
        user = request.user

        if not new_status:
            return Response(
                {'error': 'Se requiere el campo status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_status not in ['present', 'late', 'absent']:
            return Response(
                {'error': 'Estado inválido. Use: present, late, absent'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar que la sesión sea del día actual para auxiliares
        today = timezone.localdate()
        is_today = attendance.session.date == today

        # Verificar permisos según rol
        is_director = user.role == 'director'
        current_status = attendance.status

        # Si es el mismo estado, no hacer nada
        if current_status == new_status:
            return Response(
                {'error': 'El estado ya es el seleccionado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not is_director:
            # Auxiliar: solo TARDANZA -> PRESENTE del día actual
            if not is_today:
                return Response(
                    {'error': 'Solo puede corregir asistencias del día actual'},
                    status=status.HTTP_403_FORBIDDEN
                )
            if current_status != 'late' or new_status != 'present':
                return Response(
                    {'error': 'Como auxiliar solo puede cambiar TARDANZA a PRESENTE'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Director puede hacer cualquier cambio - no hay restricciones adicionales

        # Actualizar estado
        old_status = attendance.status
        attendance.status = new_status
        attendance.save()

        # Actualizar contadores de la sesión
        session = attendance.session

        # Decrementar contador anterior
        if old_status == 'present':
            session.total_present = max(0, session.total_present - 1)
        elif old_status == 'late':
            session.total_late = max(0, session.total_late - 1)
        elif old_status == 'absent':
            session.total_absent = max(0, session.total_absent - 1)

        # Incrementar contador nuevo
        if new_status == 'present':
            session.total_present += 1
        elif new_status == 'late':
            session.total_late += 1
        elif new_status == 'absent':
            session.total_absent += 1

        session.save()

        return Response({
            'message': f'Estado actualizado de {old_status} a {new_status}',
            'attendance': AttendanceSerializer(attendance).data
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today_stats(request):
    """Estadisticas del dia actual - OPTIMIZADO con una sola query"""
    today = timezone.localdate()
    session = DailySession.objects.filter(date=today).first()

    if not session:
        total_students = Student.objects.filter(is_active=True).count()
        return Response({
            'total': total_students,
            'present': 0,
            'late': 0,
            'absent': total_students
        })

    # OPTIMIZACIÓN: Una sola query con aggregate en lugar de 3 count() separados
    stats = Attendance.objects.filter(session=session).aggregate(
        present_count=Count('id', filter=Q(status='present')),
        late_count=Count('id', filter=Q(status='late')),
        absent_count=Count('id', filter=Q(status='absent'))
    )

    present_count = stats['present_count'] or 0
    late_count = stats['late_count'] or 0
    absent_count = stats['absent_count'] or 0

    # Si no hay ausentes registrados aun, calcular los que faltan
    total = session.total_students or Student.objects.filter(is_active=True).count()
    if absent_count == 0 and session.status != 'closed':
        absent_count = max(0, total - present_count - late_count)

    return Response({
        'total': total,
        'present': present_count,
        'late': late_count,
        'absent': absent_count
    })


@api_view(['GET'])
@permission_classes([AllowAny])  # Endpoint público - sin autenticación
def public_institution_name(request):
    """Obtener nombre de la institución (público, sin autenticación)"""
    from .utils import get_system_config
    config = get_system_config()
    return Response({'institution_name': config.get('institution_name', '')})


class SystemConfigView(APIView):
    """Vista para configuración del sistema"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Obtener configuración actual"""
        from .utils import get_system_config
        config = get_system_config()
        return Response(config)

    def put(self, request):
        """Actualizar configuración"""
        from .utils import DEFAULT_CONFIG, invalidate_system_config_cache
        from . import scheduler as attendance_scheduler
        data = request.data

        # Detectar si cambiaron los horarios
        time_keys = ['open_time', 'punctuality_limit', 'close_time']
        time_changed = any(key in data for key in time_keys)

        for key, value in data.items():
            if key in DEFAULT_CONFIG:
                # Convertir listas a JSON para almacenar
                if isinstance(value, list):
                    value = json.dumps(value)

                SystemConfig.objects.update_or_create(
                    config_key=key,
                    defaults={'config_value': str(value)}
                )

        # IMPORTANTE: Invalidar cache después de actualizar
        invalidate_system_config_cache()

        # Recargar scheduler si cambiaron los horarios
        if time_changed:
            try:
                attendance_scheduler.reload_schedule()
            except Exception as e:
                print(f"Error recargando scheduler: {e}")

        return Response({'message': 'Configuración guardada correctamente'})


# ==================== NOTIFICATIONS ====================

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para notificaciones"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Filtrar notificaciones por rol del usuario
        # SQLite no soporta __contains en JSONField, así que filtramos en Python
        all_notifications = Notification.objects.all().order_by('-created_at')
        # Filtrar las que incluyen el rol del usuario
        notification_ids = [
            n.id for n in all_notifications
            if user.role in (n.target_roles or [])
        ]
        return Notification.objects.filter(id__in=notification_ids).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Obtiene el conteo de notificaciones no leídas"""
        user = request.user
        read_ids = NotificationRead.objects.filter(user=user).values_list('notification_id', flat=True)
        count = self.get_queryset().exclude(id__in=read_ids).count()
        return Response({'count': count})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Marca una notificación como leída"""
        notification = self.get_object()
        NotificationRead.objects.get_or_create(
            notification=notification,
            user=request.user
        )
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Marca todas las notificaciones como leídas"""
        user = request.user
        notifications = self.get_queryset()
        for notification in notifications:
            NotificationRead.objects.get_or_create(
                notification=notification,
                user=user
            )
        return Response({'status': 'all marked as read'})


# ==================== JUSTIFICATIONS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def justify_attendance(request):
    """
    Justifica una asistencia (falta o tardanza).
    Verifica el límite de 3 justificaciones por estudiante.
    """
    user = request.user

    # Verificar permiso de justificación
    if not user.can_justify:
        return Response(
            {'error': 'No tiene permisos para justificar'},
            status=status.HTTP_403_FORBIDDEN
        )

    attendance_id = request.data.get('attendance_id')
    reason = request.data.get('reason', '').strip()
    force_reset = request.data.get('force_reset', False)

    if not attendance_id:
        return Response(
            {'error': 'Se requiere attendance_id'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not reason:
        return Response(
            {'error': 'Se requiere el motivo de justificación'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        attendance = Attendance.objects.get(id=attendance_id)
    except Attendance.DoesNotExist:
        return Response(
            {'error': 'Asistencia no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Verificar que la asistencia sea una falta o tardanza
    if attendance.status == 'present':
        return Response(
            {'error': 'No se puede justificar una asistencia presente'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verificar si ya tiene justificación
    if hasattr(attendance, 'justification'):
        return Response(
            {'error': 'Esta asistencia ya tiene una justificación'},
            status=status.HTTP_400_BAD_REQUEST
        )

    student = attendance.student

    # Obtener o crear contador de justificaciones
    counter, _ = StudentJustificationCounter.objects.get_or_create(student=student)

    # Verificar límite de justificaciones
    if counter.count >= 3 and not force_reset:
        return Response({
            'warning': True,
            'message': f'{student.full_name} ya tiene {counter.count} justificaciones. '
                       f'Si continúa, el contador se reiniciará a 0.',
            'current_count': counter.count,
            'requires_confirmation': True
        }, status=status.HTTP_200_OK)

    # Si force_reset y estamos en el límite, reiniciar contador
    if force_reset and counter.count >= 3:
        counter.count = 0
        counter.last_reset_at = timezone.now()

    # Crear justificación
    justification = Justification.objects.create(
        attendance=attendance,
        reason=reason,
        justified_by=user
    )

    # Incrementar contador
    counter.count += 1
    counter.save()

    # Crear notificación si alcanzó el límite de 3 justificaciones
    if counter.count == 3:
        Notification.objects.create(
            notification_type='justification_limit',
            title='Límite de Justificaciones Alcanzado',
            message=f'{student.full_name} ({student.dni}) ha alcanzado el límite de 3 justificaciones. '
                    f'La próxima justificación reiniciará el contador.',
            target_roles=['director', 'psicologo', 'auxiliar'],
            student=student,
            session=attendance.session
        )

    return Response({
        'success': True,
        'message': 'Justificación registrada correctamente',
        'justification': JustificationSerializer(justification).data,
        'justification_count': counter.count,
        'remaining': max(0, 3 - counter.count)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_justification_status(request, student_id):
    """Obtiene el estado de justificaciones de un estudiante"""
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Estudiante no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

    counter, _ = StudentJustificationCounter.objects.get_or_create(student=student)

    return Response({
        'student_id': student.id,
        'student_name': student.full_name,
        'count': counter.count,
        'remaining': max(0, 3 - counter.count),
        'at_limit': counter.count >= 3,
        'last_reset_at': counter.last_reset_at
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_justification(request, attendance_id):
    """Obtiene la justificación de una asistencia específica"""
    try:
        attendance = Attendance.objects.get(id=attendance_id)
    except Attendance.DoesNotExist:
        return Response(
            {'error': 'Asistencia no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )

    if hasattr(attendance, 'justification'):
        return Response({
            'has_justification': True,
            'justification': JustificationSerializer(attendance.justification).data
        })
    else:
        return Response({
            'has_justification': False,
            'justification': None
        })
