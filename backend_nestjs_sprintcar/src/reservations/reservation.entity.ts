import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ReservationStatus } from './reservation-status.enum';

@Entity('reservations')
export class ReservationEntity {
  @ApiProperty({ description: 'ID de la reserva', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ description: 'ID del usuario que reserva', example: 2 })
  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @ApiProperty({ description: 'ID del vehículo reservado', example: 5 })
  @Column({ name: 'vehicle_id', type: 'int' })
  vehicleId!: number;

  @ApiProperty({ description: 'Fecha inicio en formato DD/MM/YYYY', example: '25/03/2026' })
  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  @ApiProperty({ description: 'Fecha fin en formato DD/MM/YYYY', example: '28/03/2026' })
  @Column({ name: 'end_date', type: 'date' })
  endDate!: Date;

  @ApiProperty({ enum: ReservationStatus, description: 'Estado de la reserva' })
  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.CREATED })
  status!: ReservationStatus;

  @ApiProperty({
    description: 'Fecha y hora del ultimo cambio de estado',
    example: '2026-04-23T12:30:00.000Z',
    required: false,
  })
  @Column({ name: 'status_updated_at', type: 'datetime', nullable: true })
  statusUpdatedAt!: Date | null;

  @ApiProperty({
    description: 'Usuario que realizo el ultimo cambio de estado',
    example: 1,
    required: false,
  })
  @Column({ name: 'status_updated_by_user_id', type: 'int', nullable: true })
  statusUpdatedByUserId!: number | null;
}
