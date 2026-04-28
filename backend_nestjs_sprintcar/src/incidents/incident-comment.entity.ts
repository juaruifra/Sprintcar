import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Tabla de comentarios / log de seguimiento de una incidencia.
// Tanto el usuario que reportó como el admin pueden añadir notas para dejar
// constancia de lo que está pasando: "enviado a taller", "presupuesto aprobado", etc.
@Entity('incident_comments')
export class IncidentCommentEntity {
  @ApiProperty({ description: 'ID del comentario', example: 7 })
  @PrimaryGeneratedColumn()
  id!: number;

  // Incidencia a la que pertenece este comentario.
  @ApiProperty({ description: 'ID de la incidencia a la que pertenece', example: 1 })
  @Column({ name: 'incident_id', type: 'int' })
  incidentId!: number;

  // Usuario que escribió el comentario (puede ser el reportador o el admin).
  @ApiProperty({ description: 'ID del usuario que escribió el comentario', example: 3 })
  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  // Texto libre del comentario.
  @ApiProperty({ description: 'Texto del comentario', example: 'El taller revisará el vehículo el próximo martes.' })
  @Column({ type: 'text' })
  text!: string;

  // Fecha y hora en que se escribió. La pone la base de datos automáticamente.
  @ApiProperty({ description: 'Fecha y hora en que se escribió', example: '2026-04-28T10:30:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
