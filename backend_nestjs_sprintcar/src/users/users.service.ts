import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { parseDatabaseUniqueError } from './utils/database-error.util';

export type CreateUserInput = {
  roleId: number;
  email: string;
  passwordHash: string;
  name?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  birthDate?: Date;
  gender?: string;
  documentId?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

type AuthUserEntity = UserEntity & { passwordHash: string };

type ReactivateUserInput = {
  email: string;
  passwordHash: string;
  roleId?: number;
  name?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  birthDate?: Date;
  gender?: string;
  documentId?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

// Tipo mínimo del archivo que necesitamos para guardar avatar en Storage.
type UploadedAvatarFile = {
  mimetype: string;
  buffer: Buffer;
};

// Regex para validar fechas en formato DD/MM/YYYY.
const DATE_DDMMYYYY_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;

@Injectable()
export class UsersService {
    private parseBirthDate(value?: string): Date | null {
      if (!value) {
        return null;
      }

      // Validación defensiva para asegurar el formato esperado por negocio.
      if (!DATE_DDMMYYYY_REGEX.test(value)) {
        throw new BadRequestException('La fecha debe tener formato DD/MM/YYYY');
      }

      const [day, month, year] = value.split('/').map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    }

    private formatBirthDate(value: Date | string | null): string | undefined {
      if (!value) {
        return undefined;
      }

      // MySQL puede devolver DATE como string según configuración/driver.
      // Normalizamos aquí para que el resto del servicio siempre trabaje igual.
      let normalizedDate: Date;

      if (value instanceof Date) {
        normalizedDate = value;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        // Caso típico de MySQL DATE: "YYYY-MM-DD".
        const [year, month, day] = value.split('-').map(Number);
        normalizedDate = new Date(Date.UTC(year, month - 1, day));
      } else if (DATE_DDMMYYYY_REGEX.test(value)) {
        // Soporte adicional por si llega en formato de negocio DD/MM/YYYY.
        const [day, month, year] = value.split('/').map(Number);
        normalizedDate = new Date(Date.UTC(year, month - 1, day));
      } else {
        throw new BadRequestException('Formato de fecha no soportado para birthDate');
      }

      const day = String(normalizedDate.getUTCDate()).padStart(2, '0');
      const month = String(normalizedDate.getUTCMonth() + 1).padStart(2, '0');
      const year = normalizedDate.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByDocumentId(documentId: string): Promise<UserEntity | null> {
    // Búsqueda exacta sobre valor normalizado de documento.
    return this.usersRepository.findOne({ where: { documentId } });
  }

  async findByEmailForAuth(email: string): Promise<UserEntity | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByIdForAuth(id: number): Promise<AuthUserEntity | null> {
    // Este método añade explícitamente el hash para validaciones de seguridad.
    return (await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne()) as AuthUserEntity | null;
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    // Regla de negocio: documento único global (activos e inactivos).
    if (input.documentId) {
      const existingByDocumentId = await this.findByDocumentId(input.documentId);
      if (existingByDocumentId) {
        throw new ConflictException('errors.documentIdAlreadyExists');
      }
    }

    const user = this.usersRepository.create({
      roleId: input.roleId,
      email: input.email,
      passwordHash: input.passwordHash,
      name: input.name ?? null,
      lastName: input.lastName ?? null,
      avatarUrl: input.avatarUrl ?? null,
      phone: input.phone ?? null,
      birthDate: input.birthDate ?? null,
      gender: input.gender ?? null,
      documentId: input.documentId ?? null,
      address: input.address ?? null,
      city: input.city ?? null,
      postalCode: input.postalCode ?? null,
      country: input.country ?? null,
      isActive: true,
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      // Barrera final: si pasa validación lógica pero falla en BD por índice único,
      // mapeamos el error a clave i18n consistente con el resto de la app.
      const dbErrorKey = parseDatabaseUniqueError(error);
      if (dbErrorKey) {
        throw new ConflictException(dbErrorKey);
      }

      // Si es otro error de BD, lo relanzamos como 500 genérico.
      throw error;
    }
  }

  async reactivateUser(userId: number, input: ReactivateUserInput): Promise<UserEntity> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado para reactivación');
    }

    // Rehidratamos la cuenta inactiva con los datos del nuevo registro:
    // se reactiva, se actualiza credencial y se sobreescriben datos de perfil.
    user.isActive = true;
    user.roleId = input.roleId ?? 2;
    user.email = input.email;
    user.passwordHash = input.passwordHash;
    user.name = input.name ?? null;
    user.lastName = input.lastName ?? null;
    user.avatarUrl = input.avatarUrl ?? null;
    user.phone = input.phone ?? null;
    user.birthDate = input.birthDate ?? null;
    user.gender = input.gender ?? null;
    user.documentId = input.documentId ?? null;
    user.address = input.address ?? null;
    user.city = input.city ?? null;
    user.postalCode = input.postalCode ?? null;
    user.country = input.country ?? null;

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      // Si falla por índice único durante reactivación, mapeamos a clave i18n.
      const dbErrorKey = parseDatabaseUniqueError(error);
      if (dbErrorKey) {
        throw new ConflictException(dbErrorKey);
      }

      throw error;
    }
  }

  async updatePasswordHash(userId: number, passwordHash: string): Promise<void> {
    // Actualizamos únicamente el hash de contraseña para minimizar side effects.
    await this.usersRepository.update({ id: userId }, { passwordHash });
  }

  async getProfileById(userId: number) {
    const user = await this.findById(userId);

    if (!user || !user.isActive) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Respuesta explícita para evitar exponer campos sensibles ahora y en el futuro.
    return {
      id: user.id,
      roleId: user.roleId,
      name: user.name ?? '',
      lastName: user.lastName ?? undefined,
      email: user.email,
      phone: user.phone ?? undefined,
      birthDate: this.formatBirthDate(user.birthDate),
      documentId: user.documentId ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
    };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.findById(userId);

    if (!user || !user.isActive) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Solo tocamos campos de perfil acordados para esta fase del roadmap.
    user.name = updateProfileDto.name?.trim() || null;
    user.lastName = updateProfileDto.lastName?.trim() || null;
    user.phone = updateProfileDto.phone?.trim() || null;
    // El DTO ya normaliza formato; aquí aplicamos trim defensivo adicional.
    const normalizedDocumentId = updateProfileDto.documentId?.trim() || null;
    if (normalizedDocumentId) {
      const existingByDocumentId = await this.findByDocumentId(normalizedDocumentId);
      // Permitimos conservar el mismo documento en el propio usuario,
      // pero bloqueamos si pertenece a otro registro.
      if (existingByDocumentId && existingByDocumentId.id !== user.id) {
        throw new ConflictException('errors.documentIdAlreadyExists');
      }
    }

    user.documentId = normalizedDocumentId;
    user.birthDate = this.parseBirthDate(updateProfileDto.birthDate);

    try {
      const savedUser = await this.usersRepository.save(user);
      return this.getProfileById(savedUser.id);
    } catch (error) {
      // Si falla por índice único, mapeamos a clave i18n.
      const dbErrorKey = parseDatabaseUniqueError(error);
      if (dbErrorKey) {
        throw new ConflictException(dbErrorKey);
      }

      throw error;
    }
  }

  private getAvatarFileExtension(mimeType: string): string {
    // Convertimos MIME a extensión para mantener nombres consistentes en bucket.
    if (mimeType === 'image/png') {
      return 'png';
    }

    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      return 'jpg';
    }

    throw new BadRequestException('Tipo de archivo no permitido. Solo JPG y PNG');
  }

  private buildSupabasePublicUrl(filePath: string): string {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const bucket = this.configService.get<string>('SUPABASE_AVATARS_BUCKET') ?? 'avatars';

    if (!supabaseUrl) {
      throw new InternalServerErrorException('SUPABASE_URL no está configurado');
    }

    // Añadimos timestamp para evitar cache viejo de imagen en cliente.
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}?t=${Date.now()}`;
  }

  async uploadAvatar(userId: number, file: UploadedAvatarFile) {
    if (!file) {
      throw new BadRequestException('No se ha recibido ningún archivo');
    }

    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const bucket = this.configService.get<string>('SUPABASE_AVATARS_BUCKET') ?? 'avatars';

    if (!serviceRoleKey || !supabaseUrl) {
      throw new InternalServerErrorException('Falta configuración de Supabase Storage en backend');
    }

    const extension = this.getAvatarFileExtension(file.mimetype);
    const filePath = `${userId}.${extension}`;

    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`,
      {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': file.mimetype,
          'x-upsert': 'true',
        },
        // Convertimos Buffer a Uint8Array para cumplir con BodyInit del fetch tipado.
        body: new Uint8Array(file.buffer),
      },
    );

    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.text();
      throw new InternalServerErrorException(`Error subiendo avatar: ${uploadError}`);
    }

    const avatarUrl = this.buildSupabasePublicUrl(filePath);

    await this.usersRepository.update({ id: userId }, { avatarUrl });

    return { avatarUrl };
  }

  async deleteAvatar(userId: number) {
    // De momento solo quitamos referencia en BD para mantener flujo simple y evitar complejidad de manejo de archivos en Supabase. 
    await this.usersRepository.update({ id: userId }, { avatarUrl: null });
    return { avatarUrl: null };
  }
}
