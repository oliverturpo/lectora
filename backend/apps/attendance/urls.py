from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SessionViewSet, AttendanceViewSet, today_stats, SystemConfigView

app_name = 'attendance'

router = DefaultRouter()
router.register('sessions', SessionViewSet, basename='session')
router.register('', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('stats/today/', today_stats, name='today-stats'),
    path('config/', SystemConfigView.as_view(), name='system-config'),
    path('', include(router.urls)),
]
