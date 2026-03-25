import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ description: 'Rol del usuario (1=ADMIN, 2=NORMAL)', example: 2 })
  @Column({ name: 'role_id', type: 'int', default: 2 })
  roleId!: number;

  @ApiPropertyOptional({ description: 'Nombre del usuario', example: 'Juan' })
  // Indicamos el tipo SQL explícitamente para evitar que TypeORM infiera "Object"
  // cuando la propiedad es un union type (string | null).
  @Column({ type: 'varchar', length: 120, nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ description: 'Apellidos del usuario', example: 'Pérez García' })
  // Mismo criterio: tipo explícito para que MySQL reciba un tipo soportado.
  @Column({ name: 'last_name', type: 'varchar', length: 120, nullable: true })
  lastName!: string | null;

  @ApiProperty({ description: 'Email único del usuario', example: 'user@sprintcar.com' })
  @Column({ unique: true, length: 180 })
  email!: string;

  @Exclude()
  @ApiProperty({
    description: 'Hash de contraseña (no debe exponerse en respuestas)',
    example: '$2b$10$...hash...',
  })
  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash!: string;

  @ApiPropertyOptional({ description: 'URL del avatar del usuario', example: 'https://example.com/avatar.png' })
  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl!: string | null;

  @ApiPropertyOptional({ description: 'Teléfono del usuario', example: '+34123456789' })
  // Definimos varchar de forma explícita para evitar errores de metadata en runtime.
  @Column({ type: 'varchar', length: 25, nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ description: 'Fecha de nacimiento', example: '1995-06-15' })
  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate!: Date | null;

  @ApiPropertyOptional({ description: 'Género', example: 'female' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  gender!: string | null;

  @ApiPropertyOptional({ description: 'Documento identificativo (DNI/NIF)', example: '12345678A' })
  @Column({ name: 'document_id', type: 'varchar', length: 20, nullable: true, unique: true })
  documentId!: string | null;

  @ApiPropertyOptional({ description: 'Dirección postal', example: 'Calle Mayor 10' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  @ApiPropertyOptional({ description: 'Ciudad', example: 'Madrid' })
  @Column({ type: 'varchar', length: 120, nullable: true })
  city!: string | null;

  @ApiPropertyOptional({ description: 'Código postal', example: '28001' })
  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode!: string | null;

  @ApiPropertyOptional({ description: 'País', example: 'España' })
  @Column({ type: 'varchar', length: 80, nullable: true })
  country!: string | null;

  @ApiProperty({ description: 'Indica si el usuario está activo', example: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
