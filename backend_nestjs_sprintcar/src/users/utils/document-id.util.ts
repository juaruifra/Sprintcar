const DNI_NIE_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

// Normaliza el documento para comparación consistente: mayúsculas y sin espacios/guiones.
export function normalizeDocumentIdInput(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  // Homogeneizamos para comparar siempre la misma representación en BD:
  // - mayúsculas
  // - sin espacios
  // - sin guiones
  const normalized = value.toUpperCase().replace(/[\s-]/g, '').trim();
  return normalized.length ? normalized : undefined;
}

// Validación mínima de DNI/NIE español con comprobación de letra de control.
export function isValidSpanishDocumentId(value: string): boolean {
  const normalized = normalizeDocumentIdInput(value);

  if (!normalized) {
    return false;
  }

  // DNI: 8 dígitos + letra.
  const dniMatch = normalized.match(/^(\d{8})([A-Z])$/);
  if (dniMatch) {
    const number = Number(dniMatch[1]);
    const letter = dniMatch[2];
    // Fórmula oficial: resto módulo 23 para obtener la letra esperada.
    return DNI_NIE_LETTERS[number % 23] === letter;
  }

  // NIE: X|Y|Z + 7 dígitos + letra.
  const nieMatch = normalized.match(/^([XYZ])(\d{7})([A-Z])$/);
  if (nieMatch) {
    // En NIE se transforma X/Y/Z en 0/1/2 y se aplica la misma lógica que en DNI.
    const prefix = nieMatch[1] === 'X' ? '0' : nieMatch[1] === 'Y' ? '1' : '2';
    const number = Number(`${prefix}${nieMatch[2]}`);
    const letter = nieMatch[3];
    return DNI_NIE_LETTERS[number % 23] === letter;
  }

  // Si no cumple patrón DNI/NIE, lo marcamos inválido.
  return false;
}
