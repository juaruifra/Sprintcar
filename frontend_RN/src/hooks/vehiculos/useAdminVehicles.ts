import { useQuery } from '@tanstack/react-query';
import { vehiclesAdminQueryKey } from '../queryKeys';
import { fetchAdminVehicles } from '../../services/vehicles/vehiclesService';
import { Vehicle } from '../../types/vehicles/Vehicle';

// Query de listado de vehículos para administración.
export function useAdminVehicles(filters?: {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  status?: string;
  search?: string;
}) {
  return useQuery<Vehicle[], Error>({
    queryKey: [...vehiclesAdminQueryKey, filters ?? {}],
    queryFn: () => fetchAdminVehicles(filters),
  });
}
