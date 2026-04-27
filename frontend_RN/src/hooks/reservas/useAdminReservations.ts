import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { reservationsAdminListQueryKey } from '../queryKeys';
import {
  AdminReservationsQueryParams,
  AdminReservationsResponse,
  fetchAdminReservations,
} from '../../services/vehicles/reservationsService';

// Query paginada/filtrada de reservas admin.
export function useAdminReservations(params: Required<Pick<AdminReservationsQueryParams, 'status' | 'page' | 'limit'>> & Pick<AdminReservationsQueryParams, 'search'>) {
  return useQuery<AdminReservationsResponse, Error>({
    queryKey: reservationsAdminListQueryKey(params),
    queryFn: () => fetchAdminReservations(params),
    placeholderData: keepPreviousData,
  });
}
