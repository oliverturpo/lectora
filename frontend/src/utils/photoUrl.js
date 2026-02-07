import { BASE_URL } from '../config/constants';

/**
 * Construye la URL completa para una foto de estudiante
 * @param {string|null} photo - URL de la foto (puede ser relativa o absoluta)
 * @returns {string|null} - URL completa o null si no hay foto
 */
export function getPhotoUrl(photo) {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  return `${BASE_URL}${photo}`;
}
