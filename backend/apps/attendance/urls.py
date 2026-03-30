from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SessionViewSet, AttendanceViewSet, today_stats, SystemConfigView,
    public_institution_name, NotificationViewSet, justify_attendance,
    student_justification_status, attendance_justification
)

app_name = 'attendance'

router = DefaultRouter()
router.register('sessions', SessionViewSet, basename='session')
router.register('notifications', NotificationViewSet, basename='notification')
router.register('', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('stats/today/', today_stats, name='today-stats'),
    path('config/', SystemConfigView.as_view(), name='system-config'),
    path('institution/', public_institution_name, name='institution-name'),
    # Justification endpoints
    path('justify/', justify_attendance, name='justify-attendance'),
    path('students/<int:student_id>/justification-status/', student_justification_status, name='student-justification-status'),
    path('<int:attendance_id>/justification/', attendance_justification, name='attendance-justification'),
    path('', include(router.urls)),
]
