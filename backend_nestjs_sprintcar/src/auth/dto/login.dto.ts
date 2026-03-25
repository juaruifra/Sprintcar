import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@sprintcar.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin1234!' })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password!: string;
}
