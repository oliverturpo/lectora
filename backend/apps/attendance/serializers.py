from rest_framework import serializers
from .models import (
    DailySession, Attendance, Justification,
    StudentJustificationCounter, Notification, NotificationRead,
    ManualEntryTracker
)


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
    student_grade = serializers.CharField(source='student.grade', read_only=True)
    student_section = serializers.CharField(source='student.section', read_only=True)
    student_photo = serializers.SerializerMethodField()
    # Mantener compatibilidad con código existente
    grade = serializers.CharField(source='student.grade', read_only=True)
    section = serializers.CharField(source='student.section', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id',
            'student',
            'student_name',
            'student_dni',
            'student_grade',
            'student_section',
            'student_photo',
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

    def get_student_photo(self, obj):
        if obj.student.photo:
            return obj.student.photo.url
        return None


class AttendanceStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    present = serializers.IntegerField()
    late = serializers.IntegerField()
    absent = serializers.IntegerField()


class JustificationSerializer(serializers.ModelSerializer):
    justified_by_name = serializers.CharField(source='justified_by.full_name', read_only=True)
    student_name = serializers.CharField(source='attendance.student.full_name', read_only=True)
    session_date = serializers.DateField(source='attendance.session.date', read_only=True)

    class Meta:
        model = Justification
        fields = [
            'id',
            'attendance',
            'reason',
            'justified_by',
            'justified_by_name',
            'student_name',
            'session_date',
            'created_at',
        ]
        read_only_fields = ['id', 'justified_by', 'created_at']


class StudentJustificationStatusSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_dni = serializers.CharField(source='student.dni', read_only=True)
    remaining = serializers.SerializerMethodField()
    at_limit = serializers.SerializerMethodField()

    class Meta:
        model = StudentJustificationCounter
        fields = [
            'id',
            'student',
            'student_name',
            'student_dni',
            'count',
            'remaining',
            'at_limit',
            'last_reset_at',
        ]

    def get_remaining(self, obj):
        return max(0, 3 - obj.count)

    def get_at_limit(self, obj):
        return obj.count >= 3


class NotificationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_dni = serializers.CharField(source='student.dni', read_only=True)
    student_grade = serializers.CharField(source='student.grade', read_only=True)
    student_section = serializers.CharField(source='student.section', read_only=True)
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'title',
            'message',
            'target_roles',
            'student',
            'student_name',
            'student_dni',
            'student_grade',
            'student_section',
            'session',
            'created_at',
            'is_read',
        ]

    def get_is_read(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.reads.filter(user=request.user).exists()
        return False


class ManualEntryTrackerSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_dni = serializers.CharField(source='student.dni', read_only=True)

    class Meta:
        model = ManualEntryTracker
        fields = [
            'id',
            'student',
            'student_name',
            'student_dni',
            'count',
            'alert_sent',
            'last_entry_at',
        ]
