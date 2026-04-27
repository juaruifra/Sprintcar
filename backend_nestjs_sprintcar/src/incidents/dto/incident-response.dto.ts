import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IncidentStatus } from '../incident-status.enum';

export class IncidentVehicleDto {
  @ApiProperty({ example: 5 })
  id!: number;

  @ApiProperty({ example: '1234ABC' })
  licensePlate!: string;

  @ApiProperty({ example: 'Toyota' })
  brand!: string;

  @ApiProperty({ example: 'Corolla' })
  model!: string;
}

export class IncidentReporterDto {
  @ApiProperty({ example: 3 })
  id!: number;

  @ApiPropertyOptional({ example: 'Juan' })
  name!: string | null;

  @ApiPropertyOptional({ example: 'García' })
  lastName!: string | null;

  @ApiProperty({ example: 'juan@sprintcar.com' })
  email!: string;
}

export class IncidentResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 12 })
  reservationId!: number;

  @ApiProperty({ example: 5 })
  vehicleId!: number;

  @ApiProperty({ example: 3 })
  reportedByUserId!: number;

  @ApiProperty({ example: 'El vehículo presenta un rayón en la puerta delantera.' })
  description!: string;

  @ApiProperty({ enum: IncidentStatus, example: IncidentStatus.OPEN })
  status!: IncidentStatus;

  @ApiProperty({ example: '2026-04-27T18:00:00.000Z' })
  createdAt!: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  resolvedAt!: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  resolvedByUserId!: number | null;

  @ApiPropertyOptional({ type: () => IncidentVehicleDto, nullable: true })
  vehicle!: IncidentVehicleDto | null;

  @ApiPropertyOptional({ type: () => IncidentReporterDto, nullable: true })
  reporter!: IncidentReporterDto | null;
}

export class AdminIncidentsResponseDto {
  @ApiProperty({ type: [IncidentResponseDto] })
  items!: IncidentResponseDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;

  @ApiProperty({
    description: 'Contadores por estado',
    example: { ABIERTA: 10, RESUELTA: 15 },
  })
  counts!: Record<string, number>;
}
