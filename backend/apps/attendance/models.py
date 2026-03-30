from django.db import models
from django.conf import settings
from apps.students.models import Student


class DailySession(models.Model):
    """
    Sesión diaria de asistencia
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('open', 'Abierta'),
        ('closed', 'Cerrada'),
    ]
    
    # Fecha y horarios
    date = models.DateField(
        unique=True,
        verbose_name='Fecha'
    )
    scheduled_open_time = models.TimeField(
        verbose_name='Hora de Apertura Programada'
    )
    punctuality_limit = models.TimeField(
        verbose_name='Límite de Puntualidad'
    )
    scheduled_close_time = models.TimeField(
        verbose_name='Hora de Cierre Programada'
    )
    
    # Timestamps reales
    actual_open_time = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Hora Real de Apertura'
    )
    actual_close_time = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Hora Real de Cierre'
    )
    
    # Estado
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Estado'
    )
    
    # Estadísticas
    total_students = models.IntegerField(
        default=0,
        verbose_name='Total de Estudiantes'
    )
    total_present = models.IntegerField(
        default=0,
        verbose_name='Total Presentes'
    )
    total_late = models.IntegerField(
        default=0,
        verbose_name='Total Tardanzas'
    )
    total_absent = models.IntegerField(
        default=0,
        verbose_name='Total Faltas'
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    class Meta:
        verbose_name = 'Sesión Diaria'
        verbose_name_plural = 'Sesiones Diarias'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Sesión {self.date} - {self.get_status_display()}"
    
    @property
    def attendance_percentage(self):
        """Porcentaje de asistencia"""
        if self.total_students == 0:
            return 0
        return round((self.total_present / self.total_students) * 100, 2)


class Attendance(models.Model):
    """
    Registro de asistencia individual
    """
    STATUS_CHOICES = [
        ('present', 'Presente'),
        ('late', 'Tardanza'),
        ('absent', 'Falta'),
    ]
    
    METHOD_CHOICES = [
        ('scanner', 'Escáner'),
        ('manual', 'Manual'),
        ('automatic', 'Automático'),
    ]
    
    # Relaciones
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='attendances',
        verbose_name='Estudiante'
    )
    session = models.ForeignKey(
        DailySession,
        on_delete=models.CASCADE,
        related_name='attendances',
        verbose_name='Sesión'
    )
    registered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='registered_attendances',
        verbose_name='Registrado Por'
    )
    
    # Datos del registro
    scan_timestamp = models.DateTimeField(
        verbose_name='Hora de Escaneo'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        verbose_name='Estado'
    )
    laptop_id = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name='ID de Laptop'
    )
    registration_method = models.CharField(
        max_length=20,
        choices=METHOD_CHOICES,
        default='scanner',
        verbose_name='Método de Registro'
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    class Meta:
        verbose_name = 'Asistencia'
        verbose_name_plural = 'Asistencias'
        ordering = ['-scan_timestamp']
        unique_together = [['student', 'session']]
        indexes = [
            models.Index(fields=['session']),
            models.Index(fields=['student']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.student.full_name} - {self.session.date} - {self.get_status_display()}"


class SystemConfig(models.Model):
    """
    Configuración del sistema
    """
    config_key = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Clave'
    )
    config_value = models.TextField(
        verbose_name='Valor'
    )
    description = models.TextField(
        null=True,
        blank=True,
        verbose_name='Descripción'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Actualización'
    )
    
    class Meta:
        verbose_name = 'Configuración del Sistema'
        verbose_name_plural = 'Configuraciones del Sistema'

    def __str__(self):
        return f"{self.config_key}: {self.config_value}"


class ManualEntryTracker(models.Model):
    """
    Rastreador de entradas manuales por estudiante (acumulativo)
    Se usa para detectar estudiantes que ingresan frecuentemente por teclado
    """
    student = models.OneToOneField(
        Student,
        on_delete=models.CASCADE,
        related_name='manual_entry_tracker',
        verbose_name='Estudiante'
    )
    count = models.PositiveIntegerField(
        default=0,
        verbose_name='Conteo de Entradas Manuales'
    )
    alert_sent = models.BooleanField(
        default=False,
        verbose_name='Alerta Enviada'
    )
    last_entry_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Última Entrada Manual'
    )

    class Meta:
        verbose_name = 'Rastreador de Entrada Manual'
        verbose_name_plural = 'Rastreadores de Entrada Manual'

    def __str__(self):
        return f"{self.student.full_name} - {self.count} entradas manuales"


class Justification(models.Model):
    """
    Justificación de una asistencia (falta o tardanza)
    """
    attendance = models.OneToOneField(
        Attendance,
        on_delete=models.CASCADE,
        related_name='justification',
        verbose_name='Asistencia'
    )
    reason = models.TextField(
        verbose_name='Motivo de Justificación'
    )
    justified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='justifications_made',
        verbose_name='Justificado Por'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Justificación'
    )

    class Meta:
        verbose_name = 'Justificación'
        verbose_name_plural = 'Justificaciones'
        ordering = ['-created_at']

    def __str__(self):
        return f"Justificación: {self.attendance.student.full_name} - {self.attendance.session.date}"


class StudentJustificationCounter(models.Model):
    """
    Contador de justificaciones por estudiante (acumulativo)
    Límite de 3 justificaciones, luego se reinicia con confirmación
    """
    student = models.OneToOneField(
        Student,
        on_delete=models.CASCADE,
        related_name='justification_counter',
        verbose_name='Estudiante'
    )
    count = models.PositiveIntegerField(
        default=0,
        verbose_name='Conteo de Justificaciones'
    )
    last_reset_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Último Reinicio'
    )

    class Meta:
        verbose_name = 'Contador de Justificaciones'
        verbose_name_plural = 'Contadores de Justificaciones'

    def __str__(self):
        return f"{self.student.full_name} - {self.count} justificaciones"


class Notification(models.Model):
    """
    Notificación del sistema
    """
    NOTIFICATION_TYPES = [
        ('manual_entry_alert', 'Alerta de Entrada Manual'),
        ('justification_limit', 'Límite de Justificaciones'),
        ('system', 'Sistema'),
    ]

    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        verbose_name='Tipo de Notificación'
    )
    title = models.CharField(
        max_length=200,
        verbose_name='Título'
    )
    message = models.TextField(
        verbose_name='Mensaje'
    )
    target_roles = models.JSONField(
        default=list,
        verbose_name='Roles Destino'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name='Estudiante'
    )
    session = models.ForeignKey(
        DailySession,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name='Sesión'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )

    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_notification_type_display()})"


class NotificationRead(models.Model):
    """
    Marca de lectura de notificación por usuario
    """
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='reads',
        verbose_name='Notificación'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_reads',
        verbose_name='Usuario'
    )
    read_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Lectura'
    )

    class Meta:
        verbose_name = 'Lectura de Notificación'
        verbose_name_plural = 'Lecturas de Notificaciones'
        unique_together = [['notification', 'user']]

    def __str__(self):
        return f"{self.user.username} leyó {self.notification.title}"
