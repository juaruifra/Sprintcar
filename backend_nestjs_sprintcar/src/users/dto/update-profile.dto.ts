import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { normalizeDocumentIdInput } from '../utils/document-id.util';
import { IsSpanishDocumentId } from '../validators/is-spanish-document-id.validator';

// Regex para validar fechas en formato DD/MM/YYYY.
const DATE_DDMMYYYY_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;

// DTO para actualizar el perfil del usuario autenticado.
// Todos los campos son opcionales para permitir guardado parcial.
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'Pérez García' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @ApiPropertyOptional({ example: '+34123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  phone?: string;

  @ApiPropertyOptional({ example: '15/06/1995' })
  @IsOptional()
  @Matches(DATE_DDMMYYYY_REGEX, {
    message: 'birthDate debe tener formato DD/MM/YYYY',
  })
  birthDate?: string;

  @ApiPropertyOptional({ example: '12345678A' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => normalizeDocumentIdInput(value))
  @IsSpanishDocumentId()
  documentId?: string;
}
