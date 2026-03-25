import { useQuery } from '@tanstack/react-query';
import { reservationsMeQueryKey } from '../queryKeys';
import { fetchMyReservations, Reservation } from '../../services/vehicles/reservationsService';

// Query de reservas del usuario autenticado.
export function useMyReservations() {
  return useQuery<Reservation[], Error>({
    queryKey: reservationsMeQueryKey,
    queryFn: fetchMyReservations,
  });
}
