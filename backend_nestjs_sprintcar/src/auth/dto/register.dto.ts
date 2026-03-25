import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { normalizeDocumentIdInput } from '../../users/utils/document-id.util';
import { IsSpanishDocumentId } from '../../users/validators/is-spanish-document-id.validator';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@sprintcar.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'User1234!' })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password!: string;

  @ApiPropertyOptional({ example: 'Nombre' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'Apellido' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @ApiPropertyOptional({ example: '+34111222333' })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  phone?: string;

  @ApiPropertyOptional({ example: '1995-06-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'female' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @ApiPropertyOptional({ example: '12345678A' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => normalizeDocumentIdInput(value))
  @IsSpanishDocumentId()
  documentId?: string;

  @ApiPropertyOptional({ example: 'Calle Mayor 10' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Madrid' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ example: '28001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ example: 'España' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}
