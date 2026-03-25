import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesAdminQueryKey, vehiclesAvailableQueryKey } from '../queryKeys';
import { updateVehicle } from '../../services/vehicles/vehiclesService';
import { Vehicle, VehicleInput } from '../../types/vehicles/Vehicle';

type UpdateVehicleParams = {
  vehicleId: number;
  payload: Partial<VehicleInput>;
};

// Mutación para editar vehículo y sincronizar cache de listados.
export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation<Vehicle, Error, UpdateVehicleParams>({
    mutationFn: ({ vehicleId, payload }) => updateVehicle(vehicleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesAdminQueryKey });
      queryClient.invalidateQueries({ queryKey: vehiclesAvailableQueryKey });
    },
  });
}
