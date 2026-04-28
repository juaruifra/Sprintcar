/**
 * queryKeys.ts — fuente única de verdad para las claves de caché de React Query.
 *
 * React Query identifica cada petición por su queryKey. Si dos componentes usan
 * exactamente la misma clave, comparten caché y no hacen peticiones duplicadas.
 * Centralizar las claves aquí evita errores de typo y facilita invalidar grupos
 * enteros de datos (ej: invalidar todo lo de "reservations" de golpe).
 */

// ── Clientes ─────────────────────────────────────────────────────────────────
export const clientesQueryKey = ["clientes"] as const;

export const clienteQueryKey = (id: number) => ["clientes", id] as const;

// Reservado para pedidos cuando se implementen.
export const pedidosQueryKey = ["pedidos"] as const;

export const pedidosByClienteQueryKey = (clienteId: number) => 
    ["pedidos", "cliente", clienteId] as const;

// ── Vehículos ─────────────────────────────────────────────────────────────────
export const vehiclesAdminQueryKey = ["vehicles", "admin"] as const;

export const vehiclesAvailableQueryKey = ["vehicles", "available"] as const;

// Clave única por rango de fechas — cada combinación tiene su propia caché.
export const vehiclesAvailableByRangeQueryKey = (startDate: string, endDate: string) =>
    ["vehicles", "available", startDate, endDate] as const;

// ── Reservas ──────────────────────────────────────────────────────────────────
export const reservationsMeQueryKey = ["reservations", "me"] as const;

export const reservationsAdminQueryKey = ["reservations", "admin"] as const;

// Incluye todos los parámetros de filtro para que cada combinación tenga su caché.
export const reservationsAdminListQueryKey = (params: {
    status: string;
    page: number;
    limit: number;
    search?: string;
}) => ["reservations", "admin", params] as const;

// ── Incidencias ───────────────────────────────────────────────────────────────
// Clave genérica (sin parámetros) — útil para invalidar todo lo de "me" de golpe.
export const incidentsMeQueryKey = ["incidents", "me"] as const;

// Clave paginada del usuario: cambia con página, límite y filtro de estado.
export const incidentsMeListQueryKey = (params: { page: number; limit: number; status?: string }) =>
  ["incidents", "me", params] as const;

// Clave paginada del admin: cambia con estado, búsqueda y página.
export const incidentsAdminListQueryKey = (params: {
    status: string;
    page: number;
    limit: number;
    search?: string;
}) => ["incidents", "admin", params] as const;
