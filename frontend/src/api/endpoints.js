import api from './axios';

// Auth
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  refresh: (refresh) => api.post('/auth/refresh/', { refresh }),
  verify: (token) => api.post('/auth/verify/', { token }),
};

// Students
export const studentsAPI = {
  list: (params) => api.get('/students/', { params }),
  get: (id) => api.get(`/students/${id}/`),
  create: (data) => api.post('/students/', data),
  update: (id, data) => api.put(`/students/${id}/`, data),
  delete: (id) => api.delete(`/students/${id}/`),
  createWithPhoto: (formData) => api.post('/students/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateWithPhoto: (id, formData) => api.put(`/students/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadPhoto: (id, formData) => api.post(`/students/${id}/upload-photo/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAttendanceHistory: (id) => api.get(`/students/${id}/attendance_history/`),
};

// Attendance
export const attendanceAPI = {
  list: (params) => api.get('/attendance/', { params }),
  get: (id) => api.get(`/attendance/${id}/`),
  create: (data) => api.post('/attendance/', data),
  getBySession: (sessionId) => api.get(`/attendance/?session=${sessionId}`),
  updateStatus: (id, data) => api.patch(`/attendance/${id}/update-status/`, data),
};

// Sessions
export const sessionsAPI = {
  list: (params) => api.get('/attendance/sessions/', { params }),
  getCurrent: () => api.get('/attendance/sessions/current/'),
  open: () => api.post('/attendance/sessions/open/'),
  close: (id) => api.post(`/attendance/sessions/${id}/close/`),
};

// Reports
export const reportsAPI = {
  daily: (date) => api.get('/reports/daily/', { params: { date } }),
  byGrade: (params) => api.get('/reports/by-grade/', { params }),
  bySection: (params) => api.get('/reports/by-section/', { params }),
  exportExcel: (params) => api.get('/reports/export/excel/', {
    params,
    responseType: 'blob'
  }),
  exportPdf: (params) => api.get('/reports/export/pdf/', {
    params,
    responseType: 'blob'
  }),
  exportNominaByGrade: (params) => api.get('/reports/nomina/by-grade/', {
    params,
    responseType: 'blob'
  }),
  exportNominaOficial: () => api.get('/reports/nomina/oficial/', {
    responseType: 'blob'
  }),
  exportNominaOficialExcel: () => api.get('/reports/nomina/oficial/excel/', {
    responseType: 'blob'
  }),
  exportStudentAttendancePdf: (studentId) => api.get(`/reports/student/${studentId}/pdf/`, {
    responseType: 'blob'
  }),
  exportCompleteAttendanceExcel: (params) => api.get('/reports/attendance/complete/excel/', {
    params,
    responseType: 'blob'
  }),
};

// Stats
export const statsAPI = {
  today: () => api.get('/attendance/stats/today/'),
  byGrade: () => api.get('/attendance/stats/by-grade/'),
};

// Config
export const configAPI = {
  get: () => api.get('/attendance/config/'),
  update: (data) => api.put('/attendance/config/', data),
  getInstitutionName: () => api.get('/attendance/institution/'),
};

// Users
export const usersAPI = {
  list: () => api.get('/users/'),
  get: (id) => api.get(`/users/${id}/`),
  create: (data) => api.post('/users/', data),
  update: (id, data) => api.put(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),
  me: () => api.get('/users/me/'),
};

// Notifications
export const notificationsAPI = {
  list: () => api.get('/attendance/notifications/'),
  unreadCount: () => api.get('/attendance/notifications/unread_count/'),
  markRead: (id) => api.post(`/attendance/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/attendance/notifications/mark_all_read/'),
};

// Justifications
export const justificationsAPI = {
  create: (data) => api.post('/attendance/justify/', data),
  getStudentStatus: (studentId) => api.get(`/attendance/students/${studentId}/justification-status/`),
  getAttendanceJustification: (attendanceId) => api.get(`/attendance/${attendanceId}/justification/`),
};
