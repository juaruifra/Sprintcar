// Utilidad para parsear errores de BD y mapear a claves i18n estables.
// Detecta duplicidad de índices UNIQUE en MySQL/MariaDB y devuelve clave de negocio.

export type DatabaseErrorKey = 'errors.emailAlreadyExists' | 'errors.documentIdAlreadyExists' | null;

/**
 * Analiza un error de BD y devuelve la clave i18n correspondiente si es por índice único.
 * Detecta errores ER_DUP_ENTRY (error 1062 de MySQL) y mapea según qué columna causó el conflicto.
 *
 * @param error - Error capturado de TypeORM/MySQL
 * @returns Clave i18n si es conflicto de índice único, null si no es detectable
 */
export function parseDatabaseUniqueError(error: unknown): DatabaseErrorKey {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const err = error as Record<string, any>;

  // TypeORM wrapper: el error real está en `driverError`.
  const underlyingError = (err.driverError as Record<string, any>) || err;

  // MySQL/MariaDB: código de error ER_DUP_ENTRY es 1062.
  const code = underlyingError?.code ?? err?.code;
  const message = ((underlyingError?.message ?? err?.message) ?? '').toString().toLowerCase();

  if (code === 'ER_DUP_ENTRY' || code === 1062) {
    // Detectamos qué columna causó el conflicto examinando el mensaje.
    if (message.includes('email') || message.includes('mail_usuario')) {
      return 'errors.emailAlreadyExists';
    }

    if (message.includes('documentid') || message.includes('document_id') || message.includes('dni')) {
      return 'errors.documentIdAlreadyExists';
    }
  }

  return null;
}
