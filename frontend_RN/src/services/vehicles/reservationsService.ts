import { apiClient } from '../../lib/apiClient';

// Estados que puede devolver el backend para una reserva.
export type ReservationStatus = 'CREADA' | 'CONFIRMADA' | 'RECHAZADA' | 'CANCELADA' | 'FINALIZADA';

export type ReservationVehicleSummary = {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  pricePerDay: number;
  status: 'DISPONIBLE' | 'NO_DISPONIBLE';
  isActive: boolean;
};

export type ReservationUserSummary = {
  id: number;
  name: string | null;
  lastName: string | null;
  email: string;
};

export type Reservation = {
  id: number;
  userId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  statusUpdatedAt: string | null;
  statusUpdatedByUserId: number | null;
  user: ReservationUserSummary | null;
  vehicle: ReservationVehicleSummary | null;
};

export type AdminReservationsResponse = {
  items: Reservation[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  counts: Record<ReservationStatus, number>;
};

export type AdminReservationsQueryParams = {
  status?: 'all' | ReservationStatus;
  search?: string;
  page?: number;
  limit?: number;
};

export type CreateReservationPayload = {
  vehicleId: number;
  startDate: string; // DD/MM/YYYY
  endDate: string; // DD/MM/YYYY
};

// Reserva básica para usuario autenticado.
export async function createReservation(payload: CreateReservationPayload): Promise<Reservation> {
  return apiClient.post<Reservation>('/reservations', payload, { auth: true });
}

export async function fetchMyReservations(): Promise<Reservation[]> {
  return apiClient.get<Reservation[]>('/reservations/me', { auth: true });
}

export async function fetchAdminReservations(params?: AdminReservationsQueryParams): Promise<AdminReservationsResponse> {
  const query = new URLSearchParams();

  if (params?.status) query.set('status', params.status);
  if (params?.search?.trim()) query.set('search', params.search.trim());
  query.set('page', String(params?.page ?? 1));
  query.set('limit', String(params?.limit ?? 10));

  return apiClient.get<AdminReservationsResponse>(`/reservations/admin?${query.toString()}`, { auth: true });
}

// Acción admin para confirmar una reserva creada.
export async function confirmReservation(reservationId: number): Promise<Reservation> {
  return apiClient.patch<Reservation>(`/reservations/${reservationId}/confirm`, undefined, { auth: true });
}

// Acción admin para rechazar una reserva creada.
export async function rejectReservation(reservationId: number): Promise<Reservation> {
  return apiClient.patch<Reservation>(`/reservations/${reservationId}/reject`, undefined, { auth: true });
}

export async function cancelReservation(reservationId: number): Promise<Reservation> {
  return apiClient.patch<Reservation>(`/reservations/${reservationId}/cancel`, undefined, { auth: true });
}
