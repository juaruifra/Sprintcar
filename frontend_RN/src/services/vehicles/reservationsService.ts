import { apiClient } from '../../lib/apiClient';

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
  status: 'CREADA' | 'CANCELADA';
  user: ReservationUserSummary | null;
  vehicle: ReservationVehicleSummary | null;
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

export async function fetchAdminReservations(): Promise<Reservation[]> {
  return apiClient.get<Reservation[]>('/reservations/admin', { auth: true });
}

export async function cancelReservation(reservationId: number): Promise<Reservation> {
  return apiClient.patch<Reservation>(`/reservations/${reservationId}/cancel`, undefined, { auth: true });
}
