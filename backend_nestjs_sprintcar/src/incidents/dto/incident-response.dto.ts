import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IncidentPriority } from '../incident-priority.enum';
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

  // Nivel de urgencia que el usuario eligió al reportar.
  @ApiProperty({ enum: IncidentPriority, example: IncidentPriority.MEDIUM })
  priority!: IncidentPriority;

  // Número de comentarios en el log de seguimiento — se usa en el botón "Ver seguimiento (N)".
  @ApiProperty({ example: 2, description: 'Número de comentarios en el log de seguimiento' })
  commentCount!: number;

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

// ── Respuesta paginada para el usuario ───────────────────────────────────────
// Igual que la versión admin pero sin contadores por estado (el usuario solo ve las suyas).
export class MyIncidentsResponseDto {
  @ApiProperty({ type: [IncidentResponseDto] })
  items!: IncidentResponseDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 5 })
  limit!: number;

  @ApiProperty({ example: 8 })
  total!: number;

  @ApiProperty({ example: 2 })
  totalPages!: number;
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

// ── Comentario del log de seguimiento ────────────────────────────────────────
export class IncidentCommentResponseDto {
  @ApiProperty({ example: 7 })
  id!: number;

  @ApiProperty({ example: 1 })
  incidentId!: number;

  @ApiProperty({ example: 3 })
  userId!: number;

  // Nombre completo del autor o su email si no tiene nombre — calculado en el servicio.
  @ApiProperty({ example: 'Juan García', description: 'Nombre del autor del comentario' })
  authorName!: string;

  // true si quien escribió es admin — el frontend puede mostrar un estilo diferente.
  @ApiProperty({ example: false, description: 'true si el comentario lo escribió un administrador' })
  isAdmin!: boolean;

  @ApiProperty({ example: 'El taller revisará el vehículo el próximo martes.' })
  text!: string;

  @ApiProperty({ example: '2026-04-28T10:30:00.000Z' })
  createdAt!: string;
}
