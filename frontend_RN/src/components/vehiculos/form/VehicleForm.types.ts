import { VehicleStatus } from '../../../types/vehicles/Vehicle';

// Tipo de datos usado por el formulario de vehículos.
export type VehicleFormValues = {
  licensePlate: string;
  brand: string;
  model: string;
  year: string;
  category: string;
  pricePerDay: string;
  mileage: string;
  color: string;
  fuel: string;
  status: VehicleStatus;
};
