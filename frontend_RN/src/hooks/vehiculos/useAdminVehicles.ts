import { useQuery } from '@tanstack/react-query';
import { vehiclesAdminQueryKey } from '../queryKeys';
import { fetchAdminVehicles } from '../../services/vehicles/vehiclesService';
import { Vehicle } from '../../types/vehicles/Vehicle';

// Query de listado de vehículos para administración.
export function useAdminVehicles() {
  return useQuery<Vehicle[], Error>({
    queryKey: vehiclesAdminQueryKey,
    queryFn: fetchAdminVehicles,
  });
}
