import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  reservationsAdminQueryKey,
  reservationsMeQueryKey,
  vehiclesAvailableQueryKey,
} from '../queryKeys';
import {
  cancelReservation,
  confirmReservation,
  rejectReservation,
  Reservation,
} from '../../services/vehicles/reservationsService';

// Hook único para acciones admin sobre el estado de una reserva.
// Centraliza mutaciones e invalidaciones para no duplicar lógica.
export function useAdminReservationActions() {
  const queryClient = useQueryClient();

  const invalidateReservationQueries = async () => {
    // Refrescamos listados y disponibilidad porque un cambio de estado puede afectar ambos.
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: reservationsMeQueryKey }),
      queryClient.invalidateQueries({ queryKey: reservationsAdminQueryKey }),
      queryClient.invalidateQueries({ queryKey: vehiclesAvailableQueryKey }),
    ]);
  };

  const confirmMutation = useMutation<Reservation, Error, number>({
    mutationFn: (reservationId) => confirmReservation(reservationId),
    onSuccess: invalidateReservationQueries,
  });

  const rejectMutation = useMutation<Reservation, Error, number>({
    mutationFn: (reservationId) => rejectReservation(reservationId),
    onSuccess: invalidateReservationQueries,
  });

  const cancelMutation = useMutation<Reservation, Error, number>({
    mutationFn: (reservationId) => cancelReservation(reservationId),
    onSuccess: invalidateReservationQueries,
  });

  return {
    confirmMutation,
    rejectMutation,
    cancelMutation,
  };
}