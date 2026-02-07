from django.db import models
from django.core.validators import RegexValidator


class Student(models.Model):
    """
    Modelo de Estudiante
    """
    GRADE_CHOICES = [
        ('1ro', '1ro Secundaria'),
        ('2do', '2do Secundaria'),
        ('3ro', '3ro Secundaria'),
        ('4to', '4to Secundaria'),
        ('5to', '5to Secundaria'),
    ]
    
    # Validador para DNI (8 dígitos)
    dni_validator = RegexValidator(
        regex=r'^\d{8}$',
        message='El DNI debe tener exactamente 8 dígitos'
    )
    
    # Campos principales
    dni = models.CharField(
        max_length=8,
        unique=True,
        validators=[dni_validator],
        verbose_name='DNI'
    )
    first_name = models.CharField(
        max_length=100,
        verbose_name='Nombres'
    )
    paternal_surname = models.CharField(
        max_length=100,
        verbose_name='Apellido Paterno'
    )
    maternal_surname = models.CharField(
        max_length=100,
        verbose_name='Apellido Materno'
    )
    grade = models.CharField(
        max_length=10,
        choices=GRADE_CHOICES,
        verbose_name='Grado'
    )
    section = models.CharField(
        max_length=5,
        verbose_name='Sección'
    )
    
    # Archivos
    photo = models.ImageField(
        upload_to='students/photos/',
        null=True,
        blank=True,
        verbose_name='Foto'
    )
    barcode = models.ImageField(
        upload_to='barcodes/',
        null=True,
        blank=True,
        verbose_name='Código de Barras'
    )
    
    # Estado
    is_active = models.BooleanField(
        default=True,
        verbose_name='Activo'
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Registro'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Actualización'
    )
    
    class Meta:
        verbose_name = 'Estudiante'
        verbose_name_plural = 'Estudiantes'
        ordering = ['grade', 'section', 'paternal_surname', 'maternal_surname']
        indexes = [
            models.Index(fields=['dni']),
            models.Index(fields=['grade', 'section']),
        ]
    
    def __str__(self):
        return f"{self.paternal_surname} {self.maternal_surname}, {self.first_name} - {self.grade}{self.section}"
    
    @property
    def full_name(self):
        """Nombre completo del estudiante"""
        return f"{self.first_name} {self.paternal_surname} {self.maternal_surname}"
    
    @property
    def full_grade(self):
        """Grado completo con sección"""
        return f"{self.get_grade_display()} - Sección {self.section}"
