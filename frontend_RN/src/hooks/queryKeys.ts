// Clientes
export const clientesQueryKey = ["clientes"] as const;

export const clienteQueryKey = (id: number) => ["clientes", id] as const;

// Dejamos preparados pedidos 
export const pedidosQueryKey = ["pedidos"] as const;

export const pedidosByClienteQueryKey = (clienteId: number) => 
    ["pedidos", "cliente", clienteId] as const;

// Vehículos
export const vehiclesAdminQueryKey = ["vehicles", "admin"] as const;

export const vehiclesAvailableQueryKey = ["vehicles", "available"] as const;

export const vehiclesAvailableByRangeQueryKey = (startDate: string, endDate: string) =>
    ["vehicles", "available", startDate, endDate] as const;

// Reservas
export const reservationsMeQueryKey = ["reservations", "me"] as const;

export const reservationsAdminQueryKey = ["reservations", "admin"] as const;
