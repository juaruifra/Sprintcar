import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IncidentPriority } from './incident-priority.enum';
import { IncidentStatus } from './incident-status.enum';

@Entity('incidents')
export class IncidentEntity {
  @ApiProperty({ description: 'ID de la incidencia', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  // Reserva a la que está vinculada la incidencia.
  @ApiProperty({ description: 'ID de la reserva vinculada', example: 12 })
  @Column({ name: 'reservation_id', type: 'int' })
  reservationId!: number;

  // Vehículo desnormalizado para facilitar consultas sin JOIN obligatorio.
  @ApiProperty({ description: 'ID del vehículo afectado', example: 5 })
  @Column({ name: 'vehicle_id', type: 'int' })
  vehicleId!: number;

  // Usuario que abrió la incidencia.
  @ApiProperty({ description: 'ID del usuario que reportó la incidencia', example: 3 })
  @Column({ name: 'reported_by_user_id', type: 'int' })
  reportedByUserId!: number;

  @ApiProperty({ description: 'Descripción detallada del problema', example: 'El vehículo presenta un rayón en la puerta delantera derecha.' })
  @Column({ type: 'text' })
  description!: string;

  @ApiProperty({ enum: IncidentStatus, description: 'Estado actual de la incidencia' })
  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.OPEN })
  status!: IncidentStatus;

  // Nivel de urgencia que el usuario elige al reportar. Ayuda al admin a ordenar por importancia.
  @ApiProperty({ enum: IncidentPriority, description: 'Nivel de urgencia asignado por el usuario' })
  @Column({ type: 'enum', enum: IncidentPriority, default: IncidentPriority.MEDIUM })
  priority!: IncidentPriority;

  @ApiProperty({ description: 'Fecha y hora de creación', example: '2026-04-27T18:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiPropertyOptional({ description: 'Fecha y hora de resolución', nullable: true, example: null })
  @Column({ name: 'resolved_at', type: 'datetime', nullable: true })
  resolvedAt!: Date | null;

  @ApiPropertyOptional({ description: 'ID del admin que resolvió la incidencia', nullable: true, example: null })
  @Column({ name: 'resolved_by_user_id', type: 'int', nullable: true })
  resolvedByUserId!: number | null;
}
