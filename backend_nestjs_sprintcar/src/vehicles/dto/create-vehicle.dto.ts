import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { VehicleStatus } from '../vehicle-status.enum';

export class CreateVehicleDto {
  @ApiProperty({ example: '1234ABC' })
  @IsString()
  @MaxLength(20)
  licensePlate!: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @MaxLength(80)
  brand!: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  @MaxLength(120)
  model!: string;

  @ApiProperty({ example: 2022 })
  @IsInt()
  @Min(1950)
  @Max(2100)
  year!: number;

  @ApiPropertyOptional({ example: 'Turismo' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @ApiProperty({ example: 45.5 })
  @IsNumber()
  @IsPositive()
  pricePerDay!: number;

  @ApiPropertyOptional({ example: 45000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @ApiPropertyOptional({ example: 'Rojo' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string;

  @ApiPropertyOptional({ example: 'Gasolina' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  fuel?: string;

  @ApiPropertyOptional({ enum: VehicleStatus, example: VehicleStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
