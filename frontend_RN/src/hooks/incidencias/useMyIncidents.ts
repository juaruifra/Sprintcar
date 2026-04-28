import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { IncidentStatus, MyIncidentsResponse, fetchMyIncidents } from '../../services/incidents/incidentsService';
import { incidentsMeListQueryKey } from '../queryKeys';

// Acepta página, límite y filtro de estado opcional.
export function useMyIncidents(params: { page: number; limit: number; status?: IncidentStatus }) {
  return useQuery<MyIncidentsResponse, Error>({
    queryKey: incidentsMeListQueryKey(params),
    queryFn: () => fetchMyIncidents(params),
    // Mantiene los datos anteriores visibles mientras carga la nueva página.
    placeholderData: keepPreviousData,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}
