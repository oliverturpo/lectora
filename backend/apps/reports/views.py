"""
Views para reportes
"""
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from .services import generate_excel_report, generate_pdf_report, get_attendance_data


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
