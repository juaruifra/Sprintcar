/**
 * Formatea un número como importe en formato español
 * - miles con punto
 * - decimales con coma
 *
 * Ej: 1234567.89 --> 1.234.567,89
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}
