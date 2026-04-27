import { useQuery } from '@tanstack/react-query';
import { Incident, fetchMyIncidents } from '../../services/incidents/incidentsService';
import { incidentsMeQueryKey } from '../queryKeys';

export function useMyIncidents() {
  return useQuery<Incident[], Error>({
    queryKey: incidentsMeQueryKey,
    queryFn: fetchMyIncidents,
    // Siempre refetch al montar para mostrar datos frescos al volver a la pestaña.
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}
