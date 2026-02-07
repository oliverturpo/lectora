"""
ASGI config for Sistema de Asistencia
Expone la aplicación ASGI como una variable a nivel de módulo llamada 'application'.
Esto es usado por Django Channels para WebSockets.
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Inicializar Django ASGI application primero
django_asgi_app = get_asgi_application()

# Importar routing después de inicializar Django
from apps.attendance.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    # Django's ASGI application para manejar HTTP tradicional
    "http": django_asgi_app,
    
    # WebSocket chat handler
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
