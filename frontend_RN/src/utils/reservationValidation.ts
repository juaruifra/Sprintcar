import type { CreateReservationPayload } from '../services/vehicles/reservationsService';

// Regex de formato: DD/MM/YYYY.
const DATE_DDMMYYYY_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;

// Debe estar alineado con la misma regla del backend.
const MAX_RESERVATION_DAYS = 60;

// Claves i18n que puede devolver la validación local del frontend.
export type ReservationValidationErrorKey =
  | 'errors.invalidDateFormat'
  | 'errors.endDateBeforeStartDate'
  | 'errors.startDateInPast'
  | 'errors.reservationDurationExceeded';

/**
 * Convierte DD/MM/YYYY a Date UTC validando que la fecha exista realmente.
 *
 * Ejemplo inválido: 31/02/2026 (cumple regex pero no existe en calendario).
 */
function parseStrictBusinessDate(value: string): Date | null {
  if (!DATE_DDMMYYYY_REGEX.test(value)) {
    return null;
  }

  const [day, month, year] = value.split('/').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  // Verificamos que el Date generado mantiene exactamente los mismos componentes.
  // Si cambian, la fecha era inválida (por ejemplo 31/02 salta a marzo).
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return null;
  }

  return utcDate;
}

/**
 * Valida en frontend las reglas sencillas de reserva antes de llamar al backend.
 *
 * Si todo es válido devuelve `null`.
 * Si hay error devuelve la clave i18n correspondiente.
 */
export function validateCreateReservationPayload(
  payload: CreateReservationPayload,
): ReservationValidationErrorKey | null {
  // 1) Formato de fechas y existencia real de fecha.
  const startDate = parseStrictBusinessDate(payload.startDate);
  const endDate = parseStrictBusinessDate(payload.endDate);

  if (!startDate || !endDate) {
    return 'errors.invalidDateFormat';
  }

  // 2) Fin no puede ser anterior a inicio.
  if (endDate < startDate) {
    return 'errors.endDateBeforeStartDate';
  }

  // 3) Inicio no puede estar en el pasado.
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (startDate < todayUtc) {
    return 'errors.startDateInPast';
  }

  // 4) Duración máxima.
  const durationDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (durationDays > MAX_RESERVATION_DAYS) {
    return 'errors.reservationDurationExceeded';
  }

  return null;
}
