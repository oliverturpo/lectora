from django.db import migrations, models


# Mapeo de sección antigua a nombre de salón por grado
SECTION_MAPPING = {
    ('1ro', 'A'): 'ALBERT EINSTEIN',
    ('1ro', 'B'): 'DANIEL A CARRION',
    ('1ro', 'C'): 'PEDRO PAULET',
    ('2do', 'A'): 'JC MARIATEGUI',
    ('2do', 'B'): 'JORGE BASADRE',
    ('2do', 'C'): 'RAUL PORRAS B',
    ('3ro', 'A'): 'ISAAC NEWTON',
    ('3ro', 'B'): 'T ALVA',
    ('4to', 'A'): 'DANTE NAVA',
    ('4to', 'B'): 'GAMALIEL CHURATA',
    ('5to', 'A'): 'CARLOS OQUENDO',
    ('5to', 'B'): 'J A ENCINAS',
}

# Mapeo inverso para rollback
REVERSE_MAPPING = {v: k[1] for k, v in SECTION_MAPPING.items()}


def migrate_sections_forward(apps, schema_editor):
    """Convierte secciones A/B/C a nombres de salón"""
    Student = apps.get_model('students', 'Student')
    for student in Student.objects.all():
        key = (student.grade, student.section)
        if key in SECTION_MAPPING:
            student.section = SECTION_MAPPING[key]
            student.save(update_fields=['section'])


def migrate_sections_backward(apps, schema_editor):
    """Convierte nombres de salón a secciones A/B/C"""
    Student = apps.get_model('students', 'Student')
    for student in Student.objects.all():
        if student.section in REVERSE_MAPPING:
            student.section = REVERSE_MAPPING[student.section]
            student.save(update_fields=['section'])


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0001_initial'),
    ]

    operations = [
        # Primero cambiar max_length para permitir nombres largos
        migrations.AlterField(
            model_name='student',
            name='section',
            field=models.CharField(max_length=25, verbose_name='Sección'),
        ),
        # Luego migrar los datos
        migrations.RunPython(
            migrate_sections_forward,
            migrate_sections_backward,
        ),
    ]
