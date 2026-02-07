from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    """Admin para el modelo Student"""
    
    list_display = ['dni', 'full_name', 'grade', 'section', 'is_active', 'created_at']
    list_filter = ['grade', 'section', 'is_active']
    search_fields = ['dni', 'first_name', 'paternal_surname', 'maternal_surname']
    ordering = ['grade', 'section', 'paternal_surname']
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('dni', 'first_name', 'paternal_surname', 'maternal_surname')
        }),
        ('Información Académica', {
            'fields': ('grade', 'section')
        }),
        ('Archivos', {
            'fields': ('photo', 'barcode')
        }),
        ('Estado', {
            'fields': ('is_active',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
