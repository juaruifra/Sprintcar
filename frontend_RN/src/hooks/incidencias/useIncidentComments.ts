import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AddCommentPayload,
  IncidentComment,
  addIncidentComment,
  fetchIncidentComments,
} from '../../services/incidents/incidentsService';

// Clave única de caché para los comentarios de una incidencia concreta.
// Al incluir el id, React Query sabe que cada incidencia tiene su propio "cajón" de datos.
const commentsKey = (incidentId: number) => ['incidents', incidentId, 'comments'] as const;

/**
 * Obtiene y gestiona el log de comentarios de una incidencia.
 *
 * @param incidentId - ID de la incidencia. Si es null/undefined no lanza ninguna petición.
 */
export function useIncidentComments(incidentId: number | null) {
  const queryClient = useQueryClient();

  // Consulta: solo se ejecuta si tenemos un id válido.
  const query = useQuery<IncidentComment[], Error>({
    queryKey: incidentId !== null ? commentsKey(incidentId) : ['incidents', 'comments', 'noop'],
    queryFn: () => fetchIncidentComments(incidentId!),
    enabled: incidentId !== null,
    // Sin tiempo de caducidad para que los comentarios siempre estén frescos al abrir el modal.
    staleTime: 0,
  });

  // Mutación: añadir un comentario nuevo.
  const addMutation = useMutation<IncidentComment, Error, AddCommentPayload>({
    mutationFn: addIncidentComment,
    onSuccess: (newComment) => {
      // En lugar de refetch completo, insertamos el nuevo comentario directamente en la caché.
      // Así el usuario ve su mensaje aparecer al instante sin esperar a la red.
      queryClient.setQueryData<IncidentComment[]>(
        commentsKey(newComment.incidentId),
        (prev) => [...(prev ?? []), newComment],
      );
    },
  });

  return { query, addMutation };
}
