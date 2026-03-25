import { useQuery } from '@tanstack/react-query';
import { reservationsAdminQueryKey } from '../queryKeys';
import { fetchAdminReservations, Reservation } from '../../services/vehicles/reservationsService';

// Query de todas las reservas para vista administrador.
export function useAdminReservations() {
  return useQuery<Reservation[], Error>({
    queryKey: reservationsAdminQueryKey,
    queryFn: fetchAdminReservations,
  });
}
