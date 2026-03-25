import { apiClient } from '../../lib/apiClient';
import { Vehicle, VehicleInput } from '../../types/vehicles/Vehicle';

// Servicio centralizado para todas las llamadas de vehículos al backend.
export async function fetchAdminVehicles(): Promise<Vehicle[]> {
  return apiClient.get<Vehicle[]>('/vehicles/admin', { auth: true });
}

export async function fetchAvailableVehicles(startDate?: string, endDate?: string): Promise<Vehicle[]> {
  if (startDate && endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    return apiClient.get<Vehicle[]>(`/vehicles/available?${params.toString()}`, { auth: true });
  }

  return apiClient.get<Vehicle[]>('/vehicles/available', { auth: true });
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
