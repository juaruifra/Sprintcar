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
}
