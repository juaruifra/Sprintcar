import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesAdminQueryKey, vehiclesAvailableQueryKey } from '../queryKeys';
import { createVehicle } from '../../services/vehicles/vehiclesService';
import { Vehicle, VehicleInput } from '../../types/vehicles/Vehicle';

// Mutación para crear vehículo y refrescar listado admin.
export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation<Vehicle, Error, VehicleInput>({
    mutationFn: (payload) => createVehicle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesAdminQueryKey });
      queryClient.invalidateQueries({ queryKey: vehiclesAvailableQueryKey });
    },
  });
}
