import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleStatus } from './vehicle-status.enum';

@Entity('vehicles')
export class VehicleEntity {
  @ApiProperty({ description: 'ID del vehículo', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ description: 'Matrícula única', example: '1234ABC' })
  @Column({ type: 'varchar', length: 20, unique: true })
  licensePlate!: string;

  @ApiProperty({ description: 'Marca del vehículo', example: 'Toyota' })
  @Column({ type: 'varchar', length: 80 })
  brand!: string;

  @ApiProperty({ description: 'Modelo del vehículo', example: 'Corolla' })
  @Column({ type: 'varchar', length: 120 })
  model!: string;

  @ApiProperty({ description: 'Año del vehículo', example: 2022 })
  @Column({ type: 'int' })
  year!: number;

  @ApiPropertyOptional({ description: 'Categoría/tipo', example: 'Turismo' })
  @Column({ type: 'varchar', length: 80, nullable: true })
  category!: string | null;

  @ApiProperty({ description: 'Precio por día', example: 45.5 })
  @Column({ name: 'price_per_day', type: 'decimal', precision: 10, scale: 2 })
  pricePerDay!: string;

  @ApiPropertyOptional({ description: 'Kilometraje actual', example: 45000 })
  @Column({ type: 'int', nullable: true })
  mileage!: number | null;

  @ApiPropertyOptional({ description: 'Color', example: 'Rojo' })
  @Column({ type: 'varchar', length: 40, nullable: true })
  color!: string | null;

  @ApiPropertyOptional({ description: 'Combustible', example: 'Gasolina' })
  @Column({ type: 'varchar', length: 40, nullable: true })
  fuel!: string | null;

  @ApiProperty({ enum: VehicleStatus, description: 'Estado operativo del vehículo' })
  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.AVAILABLE })
  status!: VehicleStatus;

  @ApiProperty({ description: 'Indica si está activo', example: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
