import { apiClient } from '../../lib/apiClient';
import { Vehicle, VehicleInput } from '../../types/vehicles/Vehicle';

// Servicio centralizado para todas las llamadas de vehículos al backend.
export async function fetchAdminVehicles(filters?: {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  status?: string;
  search?: string;
}): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (filters?.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
  if (filters?.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiClient.get<Vehicle[]>(`/vehicles/admin${query}`, { auth: true });
}

export async function fetchAvailableVehicles(startDate?: string, endDate?: string): Promise<Vehicle[]> {
  if (startDate && endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    return apiClient.get<Vehicle[]>(`/vehicles/available?${params.toString()}`, { auth: true });
  }

  return apiClient.get<Vehicle[]>('/vehicles/available', { auth: true });
}

// Public vehicle listing with optional filters for user-facing catalog
export async function fetchVehicles(filters?: {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  status?: string;
  search?: string;
}): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (filters?.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
  if (filters?.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiClient.get<Vehicle[]>(`/vehicles${query}`, { auth: false });
}

export async function createVehicle(payload: VehicleInput): Promise<Vehicle> {
  return apiClient.post<Vehicle>('/vehicles', payload, { auth: true });
}

export async function updateVehicle(vehicleId: number, payload: Partial<VehicleInput>): Promise<Vehicle> {
  return apiClient.put<Vehicle>(`/vehicles/${vehicleId}`, payload, { auth: true });
}

export async function deactivateVehicle(vehicleId: number): Promise<Vehicle> {
  return apiClient.delete<Vehicle>(`/vehicles/${vehicleId}`, { auth: true });
}
