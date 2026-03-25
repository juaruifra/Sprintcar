import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

// DTO del cambio de contraseña.
// Exige contraseña actual y nueva para evitar cambios no autorizados.
export class ChangePasswordDto {
  @ApiProperty({ example: 'User1234!' })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  currentPassword!: string;

  @ApiProperty({ example: 'User5678!' })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  newPassword!: string;
}
