from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from .models import Student, SECTIONS_BY_GRADE, ALL_SECTIONS
from .serializers import StudentSerializer
from apps.attendance.models import Attendance


class StudentViewSet(viewsets.ModelViewSet):
    """ViewSet para estudiantes"""
    queryset = Student.objects.filter(is_active=True)
    serializer_class = StudentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = None  # Sin paginacion - son pocos estudiantes (~200)

    def get_queryset(self):
        queryset = Student.objects.filter(is_active=True)

        # Filtros opcionales
        grade = self.request.query_params.get('grade')
        section = self.request.query_params.get('section')
        search = self.request.query_params.get('search')

        if grade:
            queryset = queryset.filter(grade=grade)
        if section:
            queryset = queryset.filter(section=section)
        if search:
            queryset = queryset.filter(
                dni__icontains=search
            ) | queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                paternal_surname__icontains=search
            ) | queryset.filter(
                maternal_surname__icontains=search
            )

        return queryset.order_by('grade', 'section', 'paternal_surname')

    @action(detail=True, methods=['post'])
    def generate_barcode(self, request, pk=None):
        """Genera codigo de barras para el estudiante"""
        student = self.get_object()
        # TODO: Implementar generacion de codigo de barras
        return Response({'message': 'Codigo generado', 'dni': student.dni})

    @action(detail=True, methods=['get'])
    def attendance_history(self, request, pk=None):
        """
        Obtiene historial completo de asistencia de un estudiante
        """
        student = self.get_object()
        attendances = Attendance.objects.filter(
            student=student
        ).select_related('session').order_by('-session__date')

        # Calcular estadísticas
        total_days = attendances.count()
        present = attendances.filter(status='present').count()
        late = attendances.filter(status='late').count()
        absent = attendances.filter(status='absent').count()

        # Construir respuesta con datos por fecha
        history = []
        for att in attendances:
            # Convertir timestamp UTC a hora local de Perú
            hora_local = '-'
            if att.scan_timestamp:
                local_time = timezone.localtime(att.scan_timestamp)
                hora_local = local_time.strftime('%H:%M:%S')

            history.append({
                'date': att.session.date,
                'status': att.status,
                'status_display': att.get_status_display(),
                'time': hora_local,
                'method': att.get_registration_method_display()
            })

        return Response({
            'student': {
                'id': student.id,
                'dni': student.dni,
                'full_name': student.full_name,
                'grade': student.grade,
                'section': student.section,
                'photo': student.photo.url if student.photo else None
            },
            'stats': {
                'total_days': total_days,
                'present': present,
                'late': late,
                'absent': absent,
                'attendance_percentage': round((present + late) / total_days * 100, 1) if total_days > 0 else 0
            },
            'history': history
        })

    @action(detail=False, methods=['get'])
    def sections_by_grade(self, request):
        """
        Retorna las secciones disponibles por grado y la lista de todas las secciones.
        """
        return Response({
            'sections_by_grade': SECTIONS_BY_GRADE,
            'all_sections': sorted(ALL_SECTIONS)
        })
