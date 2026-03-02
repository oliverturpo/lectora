from django.urls import path
from .views import (
    DailyReportView,
    ExportExcelView,
    ExportPdfView,
    export_nomina_by_grade_pdf,
    export_nomina_oficial_pdf,
    export_nomina_oficial_excel,
    export_student_attendance_pdf
)

app_name = 'reports'

urlpatterns = [
    path('daily/', DailyReportView.as_view(), name='daily-report'),
    path('export/excel/', ExportExcelView.as_view(), name='export-excel'),
    path('export/pdf/', ExportPdfView.as_view(), name='export-pdf'),
    path('nomina/by-grade/', export_nomina_by_grade_pdf, name='nomina-by-grade'),
    path('nomina/oficial/', export_nomina_oficial_pdf, name='nomina-oficial'),
    path('nomina/oficial/excel/', export_nomina_oficial_excel, name='nomina-oficial-excel'),
    path('student/<int:student_id>/pdf/', export_student_attendance_pdf, name='student-attendance-pdf'),
]
