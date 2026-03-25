// Estado operativo simplificado acordado para esta fase.
export type VehicleStatus = 'DISPONIBLE' | 'NO_DISPONIBLE';

// Contrato de vehículo compartido entre UI, hooks y servicios.
export interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  category?: string;
  pricePerDay: number;
  mileage?: number;
  color?: string;
  fuel?: string;
  status: VehicleStatus;
  isActive: boolean;
}

// Payload de creación/edición para reusar en hooks y formularios.
export type VehicleInput = {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  category?: string;
  pricePerDay: number;
  mileage?: number;
  color?: string;
  fuel?: string;
  status: VehicleStatus;
};
