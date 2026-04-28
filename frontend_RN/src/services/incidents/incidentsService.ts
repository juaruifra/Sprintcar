import { apiClient } from '../../lib/apiClient';

export type IncidentStatus = 'ABIERTA' | 'RESUELTA';

// Los tres niveles de urgencia que el usuario puede elegir al reportar.
export type IncidentPriority = 'BAJA' | 'MEDIA' | 'ALTA';

export type IncidentVehicleSummary = {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
};

export type IncidentReporterSummary = {
  id: number;
  name: string | null;
  lastName: string | null;
  email: string;
};

export type Incident = {
  id: number;
  reservationId: number;
  vehicleId: number;
  reportedByUserId: number;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  createdAt: string;
  resolvedAt: string | null;
  resolvedByUserId: number | null;
  vehicle: IncidentVehicleSummary | null;
  reporter: IncidentReporterSummary | null;
};

// Un comentario del log de seguimiento de una incidencia.
export type IncidentComment = {
  id: number;
  incidentId: number;
  userId: number;
  // Nombre completo del autor, ya calculado por el backend.
  authorName: string;
  // true si quien escribió el comentario es el administrador.
  isAdmin: boolean;
  text: string;
  createdAt: string;
};

export type AdminIncidentsResponse = {
  items: Incident[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  counts: Record<string, number>;
};

export type AdminIncidentsQueryParams = {
  status?: 'all' | IncidentStatus;
  search?: string;
  page?: number;
  limit?: number;
};

export type CreateIncidentPayload = {
  reservationId: number;
  description: string;
  priority: IncidentPriority;
};

export type AddCommentPayload = {
  incidentId: number;
  text: string;
};

// Reportar una incidencia (usuario o admin).
export async function createIncident(payload: CreateIncidentPayload): Promise<Incident> {
  return apiClient.post<Incident>('/incidents', payload, { auth: true });
}

// Incidencias del usuario autenticado.
export async function fetchMyIncidents(): Promise<Incident[]> {
  return apiClient.get<Incident[]>('/incidents/me', { auth: true });
}

// Listado paginado para admin.
export async function fetchAdminIncidents(
  params?: AdminIncidentsQueryParams,
): Promise<AdminIncidentsResponse> {
  const query = new URLSearchParams();

  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return apiClient.get<AdminIncidentsResponse>(`/incidents/admin${qs ? `?${qs}` : ''}`, {
    auth: true,
  });
}

// Resolver una incidencia (solo admin).
export async function resolveIncident(id: number): Promise<Incident> {
  return apiClient.patch<Incident>(`/incidents/${id}/resolve`, {}, { auth: true });
}

// Obtener el log de comentarios de una incidencia.
export async function fetchIncidentComments(incidentId: number): Promise<IncidentComment[]> {
  return apiClient.get<IncidentComment[]>(`/incidents/${incidentId}/comments`, { auth: true });
}

// Añadir un comentario al log de una incidencia.
export async function addIncidentComment(payload: AddCommentPayload): Promise<IncidentComment> {
  return apiClient.post<IncidentComment>(
    `/incidents/${payload.incidentId}/comments`,
    { text: payload.text },
    { auth: true },
  );
}
