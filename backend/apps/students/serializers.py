from rest_framework import serializers
from .models import Student, SECTIONS_BY_GRADE


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

    def validate(self, data):
        """Validar que la sección corresponda al grado"""
        grade = data.get('grade', getattr(self.instance, 'grade', None))
        section = data.get('section', getattr(self.instance, 'section', None))

        if grade and section:
            valid_sections = SECTIONS_BY_GRADE.get(grade, [])
            if section not in valid_sections:
                raise serializers.ValidationError({
                    'section': f'La sección "{section}" no es válida para el grado {grade}. '
                              f'Opciones válidas: {", ".join(valid_sections)}'
                })
        return data

    def create(self, validated_data):
        """Asegurar que is_active=True al crear"""
        validated_data['is_active'] = True
        return super().create(validated_data)
