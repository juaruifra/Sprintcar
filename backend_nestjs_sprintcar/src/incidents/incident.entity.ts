import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IncidentPriority } from './incident-priority.enum';
import { IncidentStatus } from './incident-status.enum';

@Entity('incidents')
export class IncidentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // Reserva a la que está vinculada la incidencia.
  @Column({ name: 'reservation_id', type: 'int' })
  reservationId!: number;

  // Vehículo desnormalizado para facilitar consultas sin JOIN obligatorio.
  @Column({ name: 'vehicle_id', type: 'int' })
  vehicleId!: number;

  // Usuario que abrió la incidencia.
  @Column({ name: 'reported_by_user_id', type: 'int' })
  reportedByUserId!: number;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.OPEN })
  status!: IncidentStatus;

  // Nivel de urgencia que el usuario elige al reportar. Ayuda al admin a ordenar por importancia.
  @Column({ type: 'enum', enum: IncidentPriority, default: IncidentPriority.MEDIUM })
  priority!: IncidentPriority;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'resolved_at', type: 'datetime', nullable: true })
  resolvedAt!: Date | null;

  @Column({ name: 'resolved_by_user_id', type: 'int', nullable: true })
  resolvedByUserId!: number | null;
}
