from rest_framework import serializers
from .models import DailySession, Attendance
from apps.students.serializers import StudentSerializer


class DailySessionSerializer(serializers.ModelSerializer):
    attendance_percentage = serializers.ReadOnlyField()

    class Meta:
        model = DailySession
        fields = [
            'id',
            'date',
            'scheduled_open_time',
            'punctuality_limit',
            'scheduled_close_time',
            'actual_open_time',
            'actual_close_time',
            'status',
            'total_students',
            'total_present',
            'total_late',
            'total_absent',
            'attendance_percentage',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_dni = serializers.CharField(source='student.dni', read_only=True)
    grade = serializers.CharField(source='student.grade', read_only=True)
    section = serializers.CharField(source='student.section', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id',
            'student',
            'student_name',
            'student_dni',
            'grade',
            'section',
            'session',
            'registered_by',
            'scan_timestamp',
            'status',
            'laptop_id',
            'registration_method',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class AttendanceStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    present = serializers.IntegerField()
    late = serializers.IntegerField()
    absent = serializers.IntegerField()
