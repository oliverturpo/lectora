from django.urls import path
from .views import DailyReportView, ExportExcelView, ExportPdfView

app_name = 'reports'

urlpatterns = [
    path('daily/', DailyReportView.as_view(), name='daily-report'),
    path('export/excel/', ExportExcelView.as_view(), name='export-excel'),
    path('export/pdf/', ExportPdfView.as_view(), name='export-pdf'),
]
