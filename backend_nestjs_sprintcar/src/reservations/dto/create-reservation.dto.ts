import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches } from 'class-validator';

// Regex de fecha de negocio en formato DD/MM/YYYY.
const DATE_DDMMYYYY_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;

export class CreateReservationDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  vehicleId!: number;

  @ApiProperty({ example: '25/03/2026' })
  @IsString()
  @Matches(DATE_DDMMYYYY_REGEX, {
    message: 'startDate debe tener formato DD/MM/YYYY',
  })
  startDate!: string;

  @ApiProperty({ example: '28/03/2026' })
  @IsString()
  @Matches(DATE_DDMMYYYY_REGEX, {
    message: 'endDate debe tener formato DD/MM/YYYY',
  })
  endDate!: string;
}
