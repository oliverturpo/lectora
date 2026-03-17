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

// Secciones por grado (nombres de salones)
export const SECTIONS_BY_GRADE = {
  '1ro': ['ALBERT EINSTEIN', 'DANIEL A CARRION', 'PEDRO PAULET'],
  '2do': ['JC MARIATEGUI', 'JORGE BASADRE', 'RAUL PORRAS B'],
  '3ro': ['ISAAC NEWTON', 'T ALVA'],
  '4to': ['DANTE NAVA', 'GAMALIEL CHURATA'],
  '5to': ['CARLOS OQUENDO', 'J A ENCINAS'],
};

// Lista de todas las secciones únicas (para filtros)
export const ALL_SECTIONS = [
  ...new Set(Object.values(SECTIONS_BY_GRADE).flat())
].sort();

// Mantener SECTIONS para compatibilidad temporal (deprecated)
export const SECTIONS = ALL_SECTIONS;

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
