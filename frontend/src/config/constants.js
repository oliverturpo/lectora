export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

// Base URL para archivos media (sin /api)
export const BASE_URL = API_URL.replace('/api', '');

export const GRADES = [
  { value: '1ro', label: '1ro Secundaria' },
  { value: '2do', label: '2do Secundaria' },
  { value: '3ro', label: '3ro Secundaria' },
  { value: '4to', label: '4to Secundaria' },
  { value: '5to', label: '5to Secundaria' },
];

export const SECTIONS = ['A', 'B', 'C'];

export const ATTENDANCE_STATUS = {
  present: { label: 'Presente', color: '#22c55e' },
  late: { label: 'Tardanza', color: '#eab308' },
  absent: { label: 'Falta', color: '#ef4444' },
};

export const USER_ROLES = {
  director: 'Director',
  auxiliar: 'Auxiliar',
};

export const INSTITUTION_NAME = process.env.REACT_APP_INSTITUTION_NAME || 'IES Martin Chambi';
