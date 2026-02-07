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
};

// Attendance
export const attendanceAPI = {
  list: (params) => api.get('/attendance/', { params }),
  get: (id) => api.get(`/attendance/${id}/`),
  create: (data) => api.post('/attendance/', data),
  getBySession: (sessionId) => api.get(`/attendance/?session=${sessionId}`),
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
