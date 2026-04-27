import { apiClient } from '../../lib/apiClient';

export type IncidentStatus = 'ABIERTA' | 'RESUELTA';

export type Incident = {
  id: number;
  reservationId: number;
  vehicleId: number;
  reportedByUserId: number;
  description: string;
  status: IncidentStatus;
  createdAt: string;
  resolvedAt: string | null;
  resolvedByUserId: number | null;
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

// Resolver incidencia (solo admin).
export async function resolveIncident(incidentId: number): Promise<Incident> {
  return apiClient.patch<Incident>(`/incidents/${incidentId}/resolve`, {}, { auth: true });
}
