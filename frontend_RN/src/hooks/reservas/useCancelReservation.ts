import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  reservationsAdminQueryKey,
  reservationsMeQueryKey,
  vehiclesAvailableQueryKey,
} from '../queryKeys';
import { cancelReservation, Reservation } from '../../services/vehicles/reservationsService';

// Mutación para cancelar una reserva existente.
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation<Reservation, Error, number>({
    mutationFn: (reservationId) => cancelReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationsMeQueryKey });
      queryClient.invalidateQueries({ queryKey: reservationsAdminQueryKey });
      queryClient.invalidateQueries({ queryKey: vehiclesAvailableQueryKey });
    },
  });
}
