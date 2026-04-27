import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreateIncidentPayload,
  Incident,
  createIncident,
  resolveIncident,
} from '../../services/incidents/incidentsService';
import { incidentsMeQueryKey, incidentsAdminListQueryKey, vehiclesAdminQueryKey } from '../queryKeys';

export function useIncidentActions() {
  const queryClient = useQueryClient();

  const invalidateIncidents = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: incidentsMeQueryKey }),
      // Invalidamos todos los sub-parámetros del listado admin.
      queryClient.invalidateQueries({ queryKey: ['incidents', 'admin'] }),
      // Resolver restaura disponibilidad: refrescamos el catálogo de vehículos.
      queryClient.invalidateQueries({ queryKey: vehiclesAdminQueryKey }),
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'available'] }),
    ]);
  };

  const createMutation = useMutation<Incident, Error, CreateIncidentPayload>({
    mutationFn: createIncident,
    onSuccess: invalidateIncidents,
  });

  const resolveMutation = useMutation<Incident, Error, number>({
    mutationFn: resolveIncident,
    onSuccess: invalidateIncidents,
  });

  return { createMutation, resolveMutation };
}
