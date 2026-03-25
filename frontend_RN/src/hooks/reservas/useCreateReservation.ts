import { useMutation, useQueryClient } from '@tanstack/react-query';
import i18n from '../../i18n/i18n';
import { reservationsMeQueryKey, vehiclesAvailableQueryKey } from '../queryKeys';
import {
  CreateReservationPayload,
  Reservation,
  createReservation,
} from '../../services/vehicles/reservationsService';
import { validateCreateReservationPayload } from '../../utils/reservationValidation';

// Mutación para crear reserva desde usuario autenticado.
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation<Reservation, Error, CreateReservationPayload>({
    mutationFn: async (payload) => {
      // Validación rápida en frontend para evitar llamadas innecesarias al backend.
      const validationErrorKey = validateCreateReservationPayload(payload);

      if (validationErrorKey) {
        throw new Error(i18n.t(validationErrorKey));
      }

      return createReservation(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationsMeQueryKey });
      queryClient.invalidateQueries({ queryKey: vehiclesAvailableQueryKey });
    },
  });
}
