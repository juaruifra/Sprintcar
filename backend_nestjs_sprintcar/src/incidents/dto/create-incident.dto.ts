import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, MaxLength, MinLength } from 'class-validator';
import { IncidentPriority } from '../incident-priority.enum';

export class CreateIncidentDto {
  @ApiProperty({
    description: 'ID de la reserva a la que se vincula la incidencia',
    example: 12,
  })
  @IsNumber()
  reservationId!: number;

  @ApiProperty({
    description: 'Descripción de la incidencia (10–1000 caracteres)',
    example: 'El vehículo presenta un rayón en la puerta delantera derecha.',
    minLength: 10,
    maxLength: 1000,
  })
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;

  @ApiProperty({
    description: 'Nivel de urgencia que el usuario asigna',
    enum: IncidentPriority,
    example: IncidentPriority.MEDIUM,
  })
  @IsEnum(IncidentPriority)
  priority!: IncidentPriority;
}
