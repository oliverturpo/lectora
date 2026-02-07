export function isValidDNI(dni) {
  if (!dni) return false;
  return /^\d{8}$/.test(dni);
}

export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

export function minLength(value, min) {
  if (!value) return false;
  return value.length >= min;
}

export function maxLength(value, max) {
  if (!value) return true;
  return value.length <= max;
}

export function isValidTime(time) {
  if (!time) return false;
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

export function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function validateStudent(data) {
  const errors = {};

  if (!isValidDNI(data.dni)) {
    errors.dni = 'DNI debe tener 8 digitos';
  }

  if (!isRequired(data.first_name)) {
    errors.first_name = 'Nombres son requeridos';
  }

  if (!isRequired(data.paternal_surname)) {
    errors.paternal_surname = 'Apellido paterno es requerido';
  }

  if (!isRequired(data.maternal_surname)) {
    errors.maternal_surname = 'Apellido materno es requerido';
  }

  if (!isRequired(data.grade)) {
    errors.grade = 'Grado es requerido';
  }

  if (!isRequired(data.section)) {
    errors.section = 'Seccion es requerida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateConfig(data) {
  const errors = {};

  if (!isValidTime(data.open_time)) {
    errors.open_time = 'Hora de apertura invalida';
  }

  if (!isValidTime(data.punctuality_limit)) {
    errors.punctuality_limit = 'Limite de puntualidad invalido';
  }

  if (!isValidTime(data.close_time)) {
    errors.close_time = 'Hora de cierre invalida';
  }

  if (!data.working_days || data.working_days.length === 0) {
    errors.working_days = 'Debe seleccionar al menos un dia laborable';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
