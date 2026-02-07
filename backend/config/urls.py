"""
URL configuration for Sistema de Asistencia
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Authentication
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # API Apps
    path('api/students/', include('apps.students.urls')),
    path('api/attendance/', include('apps.attendance.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/reports/', include('apps.reports.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Configuración del admin
admin.site.site_header = "Sistema de Asistencia IES Túpac Amaru"
admin.site.site_title = "Asistencia Admin"
admin.site.index_title = "Panel de Administración"
