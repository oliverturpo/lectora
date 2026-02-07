import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDNI(dni) {
  if (!dni) return '';
  return dni.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
}

export function formatDate(dateString, formatStr = 'dd/MM/yyyy') {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr, { locale: es });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString) {
  if (!timeString) return '';
  try {
    if (timeString.includes('T')) {
      const date = parseISO(timeString);
      return format(date, 'HH:mm:ss');
    }
    return timeString;
  } catch {
    return timeString;
  }
}

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  try {
    const date = parseISO(dateTimeString);
    return format(date, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
  } catch {
    return dateTimeString;
  }
}

export function formatFullName(student) {
  if (!student) return '';
  const { first_name, paternal_surname, maternal_surname } = student;
  return `${paternal_surname || ''} ${maternal_surname || ''}, ${first_name || ''}`.trim();
}

export function formatGrade(grade, section) {
  if (!grade) return '';
  return section ? `${grade} - ${section}` : grade;
}

export function formatPercent(value, total) {
  if (!total || total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('es-PE').format(num);
}
