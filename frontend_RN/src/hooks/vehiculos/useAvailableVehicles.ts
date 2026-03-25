import { useQuery } from '@tanstack/react-query';
import {
  vehiclesAvailableByRangeQueryKey,
  vehiclesAvailableQueryKey,
} from '../queryKeys';
import { fetchAvailableVehicles } from '../../services/vehicles/vehiclesService';
import { Vehicle } from '../../types/vehicles/Vehicle';

type Params = {
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
};

// Query de vehículos disponibles para reservar, opcionalmente filtrados por rango.
export function useAvailableVehicles(params?: Params) {
  const startDate = params?.startDate;
  const endDate = params?.endDate;
  const enabled = params?.enabled ?? true;
  const hasRange = Boolean(startDate && endDate);

  return useQuery<Vehicle[], Error>({
    queryKey: hasRange
      ? vehiclesAvailableByRangeQueryKey(startDate as string, endDate as string)
      : vehiclesAvailableQueryKey,
    queryFn: () => fetchAvailableVehicles(startDate, endDate),
    enabled,
  });
}
