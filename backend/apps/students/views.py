from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Student
from .serializers import StudentSerializer


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
