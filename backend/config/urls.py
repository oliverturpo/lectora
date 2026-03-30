"""
URL configuration for Sistema de Asistencia
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from django.views.static import serve
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
import os


FRONTEND_BUILD_DIR = str(settings.BASE_DIR.parent / 'frontend' / 'build')
FRONTEND_STATIC_DIR = str(settings.BASE_DIR.parent / 'frontend' / 'build' / 'static')


def serve_react_static(request, path):
    """Sirve archivos estaticos del build de React (CSS, JS, images)"""
    return serve(request, path, document_root=FRONTEND_STATIC_DIR)


def serve_react(request, path=''):
    """Sirve el frontend React compilado"""
    # Si es un archivo en la raiz del build (manifest.json, favicon, etc)
    if path:
        file_path = os.path.join(FRONTEND_BUILD_DIR, path)
        if os.path.isfile(file_path):
            return serve(request, path, document_root=FRONTEND_BUILD_DIR)

    # Para todo lo demas, servir index.html (SPA)
    index_path = os.path.join(FRONTEND_BUILD_DIR, 'index.html')
    if os.path.isfile(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')

    return HttpResponse('Frontend no compilado. Ejecuta: cd frontend && npm run build', status=404)

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

# Servir archivos estaticos del frontend React (CSS, JS, images)
urlpatterns += [
    re_path(r'^static/(?P<path>.*)$', serve_react_static, name='react_static'),
]

# Servir archivos media (fotos de estudiantes, etc)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Servir frontend React (DEBE ir al final - captura todas las rutas restantes)
urlpatterns += [
    re_path(r'^(?P<path>.*)$', serve_react, name='frontend'),
]

# Configuración del admin
institution_name = settings.INSTITUTION_CONFIG.get('NAME', 'IES')
admin.site.site_header = f"Sistema de Asistencia {institution_name}"
admin.site.site_title = "Asistencia Admin"
admin.site.index_title = "Panel de Administración"
