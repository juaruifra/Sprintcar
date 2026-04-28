import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

// Datos que se envían al añadir un nuevo comentario a una incidencia.
export class CreateIncidentCommentDto {
  @ApiProperty({
    description: 'Texto del comentario (máximo 1000 caracteres)',
    example: 'El taller revisará el vehículo el próximo martes.',
    maxLength: 1000,
  })
  @IsNotEmpty()
  @MaxLength(1000)
  text!: string;
}
