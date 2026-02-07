from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Usuario personalizado del sistema
    Extiende AbstractUser de Django
    """
    ROLE_CHOICES = [
        ('director', 'Director'),
        ('auxiliar', 'Auxiliar'),
    ]
    
    # Campos adicionales
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='auxiliar',
        verbose_name='Rol'
    )
    full_name = models.CharField(
        max_length=200,
        verbose_name='Nombre Completo'
    )
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"
    
    @property
    def is_director(self):
        """Verifica si el usuario es director"""
        return self.role == 'director'
    
    @property
    def is_auxiliar(self):
        """Verifica si el usuario es auxiliar"""
        return self.role == 'auxiliar'
