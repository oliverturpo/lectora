"""
Views para reportes
"""
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.conf import settings
from .services import (
    generate_excel_report,
    generate_pdf_report,
    get_attendance_data,
    generate_nomina_by_grade_pdf,
    generate_nomina_oficial_pdf,
    generate_nomina_oficial_excel,
    generate_student_attendance_pdf,
    generate_complete_attendance_excel
)


class DailyReportView(APIView):
    """Vista para obtener datos del reporte diario"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get('date')
        grade = request.query_params.get('grade')

        if date_str:
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Formato de fecha invalido'}, status=400)
        else:
            date = datetime.now().date()

        session, data = get_attendance_data(date, grade)

        if not session:
            return Response({
                'date': date.isoformat(),
                'session': None,
                'records': [],
                'stats': {'total': 0, 'present': 0, 'late': 0, 'absent': 0}
            })

        return Response({
            'date': date.isoformat(),
            'session': {
                'id': session.id,
                'status': session.status,
                'open_time': session.actual_open_time.isoformat() if session.actual_open_time else None,
                'close_time': session.actual_close_time.isoformat() if session.actual_close_time else None,
            },
            'records': data,
            'stats': {
                'total': session.total_students,
                'present': session.total_present,
                'late': session.total_late,
                'absent': session.total_absent,
            }
        })


class ExportExcelView(APIView):
    """Exportar reporte en formato Excel"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get('date')
        grade = request.query_params.get('grade')
        status = request.query_params.get('status')

        if date_str:
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Formato de fecha invalido'}, status=400)
        else:
            date = datetime.now().date()

        buffer = generate_excel_report(date, grade, status)

        filename = f"asistencia_{date.strftime('%Y%m%d')}"
        if grade:
            filename += f"_{grade}"
        if status:
            filename += f"_{status}"
        filename += ".xlsx"

        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        return response


class ExportPdfView(APIView):
    """Exportar reporte en formato PDF"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get('date')
        grade = request.query_params.get('grade')
        status = request.query_params.get('status')

        if date_str:
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Formato de fecha invalido'}, status=400)
        else:
            date = datetime.now().date()

        buffer = generate_pdf_report(date, grade, status)

        filename = f"asistencia_{date.strftime('%Y%m%d')}"
        if grade:
            filename += f"_{grade}"
        if status:
            filename += f"_{status}"
        filename += ".pdf"

        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/pdf'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_nomina_by_grade_pdf(request):
    """
    Exporta nómina de estudiantes por grado a PDF
    """
    grade = request.GET.get('grade')
    section = request.GET.get('section', None)

    if not grade:
        return Response({'error': 'Parámetro grade es requerido'}, status=400)

    buffer = generate_nomina_by_grade_pdf(grade, section)

    section_part = f"_{section}" if section else "_todas"
    filename = f'nomina_{grade}{section_part}.pdf'
    response = HttpResponse(buffer.read(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_nomina_oficial_pdf(request):
    """
    Exporta nómina oficial completa del colegio a PDF
    """
    buffer = generate_nomina_oficial_pdf()

    institution = settings.INSTITUTION_CONFIG.get('NAME', 'IES').replace(' ', '_')
    filename = f'nomina_oficial_{institution}.pdf'
    response = HttpResponse(buffer.read(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_student_attendance_pdf(request, student_id):
    """
    Exporta el historial de asistencia de un estudiante a PDF
    """
    buffer = generate_student_attendance_pdf(student_id)

    if not buffer:
        return Response({'error': 'Estudiante no encontrado'}, status=404)

    filename = f'asistencia_estudiante_{student_id}.pdf'
    response = HttpResponse(buffer.read(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_nomina_oficial_excel(request):
    """
    Exporta nómina oficial completa del colegio a Excel.
    Cada hoja corresponde a un grado y sección existente.
    """
    buffer = generate_nomina_oficial_excel()

    institution = settings.INSTITUTION_CONFIG.get('NAME', 'IES').replace(' ', '_')
    year = datetime.now().year
    filename = f'nomina_oficial_{institution}_{year}.xlsx'

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_complete_attendance_excel(request):
    """
    Exporta registro completo de asistencia a Excel.
    Cada hoja corresponde a un grado y sección.
    Columnas: DNI | Nombre | Grado | Sección | Fecha1 | Fecha2 | ... | % Asistencia
    """
    grade = request.GET.get('grade', None)
    section = request.GET.get('section', None)

    buffer = generate_complete_attendance_excel(grade, section)

    institution = settings.INSTITUTION_CONFIG.get('NAME', 'IES').replace(' ', '_')
    year = datetime.now().year
    filename = f'asistencia_completa_{institution}_{year}.xlsx'

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
