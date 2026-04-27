import { IsNotEmpty, IsNumber, MaxLength, MinLength } from 'class-validator';

export class CreateIncidentDto {
  @IsNumber()
  reservationId!: number;

  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;
}
