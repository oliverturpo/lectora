"""
WebSocket consumers para asistencia en tiempo real
"""
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
import json
from .utils import get_attendance_times

# Grupos para notificaciones por rol
NOTIFICATION_GROUPS = ['notifications_director', 'notifications_auxiliar', 'notifications_psicologo']


class AttendanceConsumer(AsyncWebsocketConsumer):
    """
    Consumer para manejar conexiones WebSocket de asistencia
    """

    async def connect(self):
        """Cuando un cliente se conecta"""
        self.room_group_name = 'attendance'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        """Cuando un cliente se desconecta"""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Cuando se recibe un mensaje"""
        try:
            data = json.loads(text_data)
            msg_type = data.get('type')

            if msg_type == 'scan_attendance':
                await self.handle_scan_attendance(data)
            else:
                # Retransmitir otros mensajes
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'attendance_message',
                        'message': data
                    }
                )
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def handle_scan_attendance(self, data):
        """Procesa un escaneo de asistencia"""
        dni = data.get('dni')
        laptop_id = data.get('laptop_id', 'WEB')
        method = data.get('method', 'scanner')

        if not dni:
            await self.send_error('DNI no proporcionado')
            return

        # Procesar en la base de datos
        result = await self.register_attendance(dni, laptop_id, method)

        if result['success']:
            # Enviar a todos los clientes
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'attendance_message',
                    'message': {
                        'type': 'attendance_registered',
                        'data': result['data'],
                        'counters': result['counters']
                    }
                }
            )

            # Si hay una notificación de entrada manual, enviarla a los grupos correspondientes
            if result.get('notification'):
                notification = result['notification']
                for role in notification.get('target_roles', []):
                    group_name = f'notifications_{role}'
                    await self.channel_layer.group_send(
                        group_name,
                        {
                            'type': 'notification_message',
                            'message': {
                                'type': 'new_notification',
                                'notification': notification
                            }
                        }
                    )
        else:
            await self.send(text_data=json.dumps({
                'type': 'attendance_error',
                'message': result['message']
            }))

    @database_sync_to_async
    def register_attendance(self, dni, laptop_id, method='scanner'):
        """Registra la asistencia en la base de datos - OPTIMIZADO"""
        from apps.students.models import Student
        from apps.attendance.models import DailySession, Attendance, ManualEntryTracker, Notification
        from .utils import get_system_config, get_attendance_times

        # OPTIMIZACIÓN: Una sola llamada a config (con cache)
        config = get_system_config()
        working_days = config.get('working_days', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])
        day_names = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        today_name = day_names[timezone.localdate().weekday()]

        if today_name not in working_days:
            return {'success': False, 'message': f'Hoy no es día laborable. No se registra asistencia.'}

        # Buscar estudiante con select_related si tiene relaciones
        try:
            student = Student.objects.get(dni=dni, is_active=True)
        except Student.DoesNotExist:
            return {'success': False, 'message': f'Estudiante con DNI {dni} no encontrado'}

        # OPTIMIZACIÓN: Reusar config para obtener times (evita query duplicada)
        times = get_attendance_times(config)
        now = timezone.localtime().time()

        # Verificar si es hora válida ANTES de crear/usar sesión
        if now < times['open_time']:
            return {'success': False, 'message': f'La sesión aún no abre. Hora de apertura: {times["open_time"].strftime("%H:%M")}'}

        if now > times['close_time']:
            return {'success': False, 'message': f'Hora de cierre superada ({times["close_time"].strftime("%H:%M")}). No se pueden registrar más asistencias.'}

        # Obtener o crear sesion del dia
        today = timezone.localdate()
        session = DailySession.objects.filter(date=today).first()

        if not session:
            # Crear sesion automaticamente (solo si estamos en horario válido)
            session = DailySession.objects.create(
                date=today,
                scheduled_open_time=times['open_time'],
                punctuality_limit=times['punctuality_limit'],
                scheduled_close_time=times['close_time'],
                status='open',
                actual_open_time=timezone.now(),
                total_students=Student.objects.filter(is_active=True).count()
            )

        # Verificar si la sesion esta cerrada manualmente
        if session.status == 'closed':
            return {'success': False, 'message': 'La sesión está cerrada. No se pueden registrar más asistencias.'}

        # Verificar si ya tiene asistencia hoy
        existing = Attendance.objects.filter(student=student, session=session).first()
        if existing:
            photo_url = student.photo.url if student.photo else None
            return {
                'success': True,
                'already_registered': True,
                'data': {
                    'id': existing.id,
                    'dni': student.dni,
                    'student_name': student.full_name,
                    'grade': student.grade,
                    'section': student.section,
                    'photo': photo_url,
                    'status': existing.status,
                    'scan_timestamp': existing.scan_timestamp.isoformat(),
                    'message': 'Ya registrado'
                },
                'counters': {
                    'total': session.total_students,
                    'present': session.total_present,
                    'late': session.total_late,
                    'absent': session.total_students - session.total_present - session.total_late
                }
            }

        # Determinar estado (puntual o tardanza)
        now = timezone.localtime().time()
        if now <= session.punctuality_limit:
            att_status = 'present'
        else:
            att_status = 'late'

        # Crear registro de asistencia
        attendance = Attendance.objects.create(
            student=student,
            session=session,
            scan_timestamp=timezone.now(),
            status=att_status,
            laptop_id=laptop_id,
            registration_method=method
        )

        # Actualizar contadores de la sesion
        if att_status == 'present':
            session.total_present += 1
        else:
            session.total_late += 1
        session.save()

        # === RASTREO DE ENTRADA MANUAL ===
        notification_data = None
        if method == 'manual':
            tracker, _ = ManualEntryTracker.objects.get_or_create(student=student)
            tracker.count += 1
            tracker.last_entry_at = timezone.now()
            tracker.save()

            # Si alcanzó 3 entradas manuales y no se ha enviado alerta
            if tracker.count >= 3 and not tracker.alert_sent:
                # Crear notificación
                notification = Notification.objects.create(
                    notification_type='manual_entry_alert',
                    title='Alerta: Entrada Manual Frecuente',
                    message=f'{student.full_name} ({student.dni}) ha ingresado {tracker.count} veces por teclado. '
                            f'Se recomienda verificar su carnet.',
                    target_roles=['auxiliar', 'psicologo'],
                    student=student,
                    session=session
                )
                tracker.alert_sent = True
                tracker.save()

                notification_data = {
                    'id': notification.id,
                    'type': notification.notification_type,
                    'title': notification.title,
                    'message': notification.message,
                    'student_name': student.full_name,
                    'student_dni': student.dni,
                    'target_roles': notification.target_roles,
                    'created_at': notification.created_at.isoformat()
                }

        # Preparar respuesta
        photo_url = student.photo.url if student.photo else None
        result = {
            'success': True,
            'data': {
                'id': attendance.id,
                'dni': student.dni,
                'student_name': student.full_name,
                'grade': student.grade,
                'section': student.section,
                'photo': photo_url,
                'status': att_status,
                'scan_timestamp': attendance.scan_timestamp.isoformat(),
                'laptop_id': laptop_id,
                'registration_method': method
            },
            'counters': {
                'total': session.total_students,
                'present': session.total_present,
                'late': session.total_late,
                'absent': session.total_students - session.total_present - session.total_late
            }
        }

        if notification_data:
            result['notification'] = notification_data

        return result

    async def send_error(self, message):
        """Envia un mensaje de error"""
        await self.send(text_data=json.dumps({
            'type': 'attendance_error',
            'message': message
        }))

    async def attendance_message(self, event):
        """Enviar mensaje al WebSocket"""
        await self.send(text_data=json.dumps(event['message']))

    async def notification_message(self, event):
        """Enviar notificación al WebSocket"""
        await self.send(text_data=json.dumps(event['message']))


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    Consumer para manejar notificaciones en tiempo real por rol
    """

    async def connect(self):
        """Cuando un cliente se conecta"""
        # Intentar obtener el rol del usuario desde query params o scope
        self.user_role = self.scope.get('url_route', {}).get('kwargs', {}).get('role', 'auxiliar')

        # Grupo de notificaciones por rol
        self.notification_group = f'notifications_{self.user_role}'

        await self.channel_layer.group_add(
            self.notification_group,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        """Cuando un cliente se desconecta"""
        await self.channel_layer.group_discard(
            self.notification_group,
            self.channel_name
        )

    async def receive(self, text_data):
        """Cuando se recibe un mensaje"""
        try:
            data = json.loads(text_data)
            msg_type = data.get('type')

            if msg_type == 'set_role':
                # Cambiar grupo si se actualiza el rol
                old_group = self.notification_group
                self.user_role = data.get('role', 'auxiliar')
                self.notification_group = f'notifications_{self.user_role}'

                await self.channel_layer.group_discard(old_group, self.channel_name)
                await self.channel_layer.group_add(self.notification_group, self.channel_name)

                await self.send(text_data=json.dumps({
                    'type': 'role_updated',
                    'role': self.user_role
                }))

        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def notification_message(self, event):
        """Enviar notificación al WebSocket"""
        await self.send(text_data=json.dumps(event['message']))
