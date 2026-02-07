from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Student"""
    full_name = serializers.ReadOnlyField()
    full_grade = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = [
            'id',
            'dni',
            'first_name',
            'paternal_surname',
            'maternal_surname',
            'grade',
            'section',
            'photo',
            'barcode',
            'is_active',
            'full_name',
            'full_grade',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'barcode', 'is_active', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Asegurar que is_active=True al crear"""
        validated_data['is_active'] = True
        return super().create(validated_data)
