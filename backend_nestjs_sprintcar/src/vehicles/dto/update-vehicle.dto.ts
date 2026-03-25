import { PartialType } from '@nestjs/swagger';
import { CreateVehicleDto } from './create-vehicle.dto';

// Reutilizamos validaciones de creación y las convertimos en opcionales para edición.
export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}
