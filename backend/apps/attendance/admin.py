from django.contrib import admin
from .models import DailySession, Attendance, SystemConfig


@admin.register(DailySession)
class DailySessionAdmin(admin.ModelAdmin):
    """Admin para el modelo DailySession"""
    
    list_display = ['date', 'status', 'total_present', 'total_late', 'total_absent', 'attendance_percentage']
    list_filter = ['status', 'date']
    search_fields = ['date']
    ordering = ['-date']
    
    fieldsets = (
        ('Información de la Sesión', {
            'fields': ('date', 'status')
        }),
        ('Horarios Programados', {
            'fields': ('scheduled_open_time', 'punctuality_limit', 'scheduled_close_time')
        }),
        ('Horarios Reales', {
            'fields': ('actual_open_time', 'actual_close_time')
        }),
        ('Estadísticas', {
            'fields': ('total_students', 'total_present', 'total_late', 'total_absent')
        }),
    )
    
    readonly_fields = ['created_at']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    """Admin para el modelo Attendance"""
    
    list_display = ['student', 'session', 'status', 'scan_timestamp', 'registration_method', 'laptop_id']
    list_filter = ['status', 'registration_method', 'session__date']
    search_fields = ['student__dni', 'student__first_name', 'student__paternal_surname']
    ordering = ['-scan_timestamp']
    
    fieldsets = (
        ('Información', {
            'fields': ('student', 'session', 'status')
        }),
        ('Detalles del Registro', {
            'fields': ('scan_timestamp', 'registration_method', 'laptop_id', 'registered_by')
        }),
    )
    
    readonly_fields = ['created_at']


@admin.register(SystemConfig)
class SystemConfigAdmin(admin.ModelAdmin):
    """Admin para el modelo SystemConfig"""
    
    list_display = ['config_key', 'config_value', 'updated_at']
    search_fields = ['config_key', 'config_value']
    ordering = ['config_key']
    
    fieldsets = (
        ('Configuración', {
            'fields': ('config_key', 'config_value', 'description')
        }),
    )
    
    readonly_fields = ['updated_at']
