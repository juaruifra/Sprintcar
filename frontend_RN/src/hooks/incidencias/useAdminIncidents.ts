import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  AdminIncidentsQueryParams,
  AdminIncidentsResponse,
  fetchAdminIncidents,
} from '../../services/incidents/incidentsService';
import { incidentsAdminListQueryKey } from '../queryKeys';

export function useAdminIncidents(
  params: Required<Pick<AdminIncidentsQueryParams, 'status' | 'page' | 'limit'>> &
    Pick<AdminIncidentsQueryParams, 'search'>,
) {
  return useQuery<AdminIncidentsResponse, Error>({
    queryKey: incidentsAdminListQueryKey(params),
    queryFn: () => fetchAdminIncidents(params),
    placeholderData: keepPreviousData,
  });
}
