import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesAdminQueryKey, vehiclesAvailableQueryKey } from '../queryKeys';
import { deactivateVehicle } from '../../services/vehicles/vehiclesService';
import { Vehicle } from '../../types/vehicles/Vehicle';

// Mutación de baja lógica (desactivar) para vehículo.
export function useDeactivateVehicle() {
  const queryClient = useQueryClient();

  return useMutation<Vehicle, Error, number>({
    mutationFn: (vehicleId) => deactivateVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesAdminQueryKey });
      queryClient.invalidateQueries({ queryKey: vehiclesAvailableQueryKey });
    },
  });
}
