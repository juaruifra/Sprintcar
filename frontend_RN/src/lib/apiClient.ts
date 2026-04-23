import i18n from '../i18n/i18n';
import { getToken } from '../storage/authStorage';

// URL base del backend leída desde variables públicas de Expo.
// Esta URL es donde nuestro servidor NestJS está escuchando.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

function ensureApiUrl(): string {
  if (!API_URL) {
    throw new Error(i18n.t('errors.apiBaseUrlMissing'));
  }

  // Eliminamos el trailing slash si existe, para evitar URLs dobles como /api//usuarios.
  return API_URL.replace(/\/$/, '');
}

type ApiRequestOptions = {
  auth?: boolean;
  headers?: Record<string, string>;
  fallbackErrorMessage?: string;
};

/**
 * Convierte mensajes de error del backend a texto traducido en el idioma del usuario.
 * 
 * El backend devuelve errores como claves i18n (ej: "errors.documentIdAlreadyExists").
 * Esta función detecta si el mensaje es una clave válida y la traduce automáticamente.
 * 
 * Si es un string: intenta traducir esa clave.
 * Si es un array: traduce cada elemento y los une con comas.
 * Si no es ninguno de los anteriores: devuelve null.
 */
function translateApiErrorMessage(message: unknown): string | null {
  // Si es un string simple, verificamos si es una clave i18n válida y la traducimos.
  if (typeof message === 'string') {
    return i18n.exists(message) ? i18n.t(message) : message;
  }

  // Si es un array (NestJS a veces devuelve validaciones así) traducimos cada elemento.
  if (Array.isArray(message)) {
    const translated = message
      .map((item) => (typeof item === 'string' ? (i18n.exists(item) ? i18n.t(item) : item) : null))
      .filter((item): item is string => Boolean(item));

    // Unimos los mensajes traducidos con comas, o null si el array quedó vacío.
    return translated.length ? translated.join(', ') : null;
  }

  // Si no es string ni array, devolvemos null (sin traducción posible).
  return null;
}

/**
 * Parsea la respuesta del backend y lanza error si algo salió mal.
 * 
 * Si la respuesta es OK (2xx):
 * - Extrae y devuelve el JSON del body.
 * 
 * Si es un error (4xx, 5xx):
 * - Intenta traducir el mensaje de error si es una clave i18n.
 * - Si no hay mensaje o no es traducible, usa el fallback.
 * - Si tampoco hay fallback, usa un mensaje genérico del i18n.
 */
async function parseApiResponse<T>(
  response: Response,
  fallbackErrorMessage?: string,
): Promise<T> {
  // Intentamos parsear el JSON de la respuesta. Si falla (respuesta vacía), results null.
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    // El backend lanzó un error. Intentamos traducir su mensaje.
    const translatedMessage = translateApiErrorMessage(body?.message);

    // Usamos el mensaje traducido, o fallback, o un error genérico del i18n.
    throw new Error(translatedMessage ?? fallbackErrorMessage ?? i18n.t('common.unexpectedError'));
  }

  return body as T;
}

async function buildHeaders(
  auth: boolean,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    ...(extraHeaders ?? {}),
  };

  // Si la ruta es protegida, añadimos token JWT del storage local.
  if (auth) {
    const token = await getToken();

    if (!token) {
      throw new Error(i18n.t('errors.userNotAuthenticated'));
    }

    headers.Authorization = `Bearer ${token}`;
  }

  // Si el body es JSON y no nos pasan Content-Type, lo forzamos aquí.
  // Si es FormData NO lo ponemos para que fetch calcule boundary correctamente.
  const hasBody = typeof body !== 'undefined';
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const hasContentType =
    Object.keys(headers).some((key) => key.toLowerCase() === 'content-type');

  if (hasBody && !isFormData && !hasContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  options?: ApiRequestOptions,
): Promise<T> {
  const baseUrl = ensureApiUrl();
  const auth = options?.auth ?? false;
  const headers = await buildHeaders(auth, body, options?.headers);

  // Transformamos body JSON automáticamente, pero respetamos FormData tal cual.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const serializedBody =
    typeof body === 'undefined' ? undefined : isFormData ? body : JSON.stringify(body);

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: serializedBody as BodyInit | undefined,
  });

  return parseApiResponse<T>(response, options?.fallbackErrorMessage);
}

// Fachada de cliente HTTP para simplificar llamadas en servicios.
export const apiClient = {
  request,
  get: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};
