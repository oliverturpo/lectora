import json
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import DailySession, Attendance, SystemConfig
from .serializers import DailySessionSerializer, AttendanceSerializer
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
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        return queryset.select_related('student', 'session')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today_stats(request):
    """Estadisticas del dia actual"""
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

    # Contar desde los registros reales para evitar inconsistencias
    attendances = Attendance.objects.filter(session=session)
    present_count = attendances.filter(status='present').count()
    late_count = attendances.filter(status='late').count()
    absent_count = attendances.filter(status='absent').count()

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
        from .utils import DEFAULT_CONFIG
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

        # Recargar scheduler si cambiaron los horarios
        if time_changed:
            try:
                attendance_scheduler.reload_schedule()
            except Exception as e:
                print(f"Error recargando scheduler: {e}")

        return Response({'message': 'Configuración guardada correctamente'})
