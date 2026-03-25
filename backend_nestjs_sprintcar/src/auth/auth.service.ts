import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private formatBirthDate(value: Date | string | null | undefined): string | undefined {
    if (!value) {
      return undefined;
    }

    // Soportamos Date nativo y string de MySQL (YYYY-MM-DD) para mantener formato de negocio.
    if (value instanceof Date) {
      const day = String(value.getUTCDate()).padStart(2, '0');
      const month = String(value.getUTCMonth() + 1).padStart(2, '0');
      const year = value.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      return `${day}/${month}/${year}`;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      return value;
    }

    return undefined;
  }

  private buildAuthResponse(user: UserEntity, accessToken: string) {
    // Centralizamos este mapper para que login y register devuelvan el mismo contrato.
    return {
      accessToken,
      user: {
        id: user.id,
        roleId: user.roleId,
        name: user.name ?? '',
        lastName: user.lastName ?? undefined,
        email: user.email,
        phone: user.phone ?? undefined,
        birthDate: this.formatBirthDate(user.birthDate),
        documentId: user.documentId ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailForAuth(loginDto.email.toLowerCase().trim());

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isValidPassword = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      roleId: user.roleId,
      email: user.email,
    });

    return this.buildAuthResponse(user, accessToken);
  }

  async register(registerDto: RegisterDto) {
    // 1) Normalizamos email/documento para comparar de forma consistente.
    const normalizedEmail = registerDto.email.toLowerCase().trim();
    const fallbackName = normalizedEmail.split('@')[0];
    const normalizedDocumentId = registerDto.documentId?.trim();

    if (normalizedDocumentId) {
      // 2) Si el documento ya existe, aplicamos política de unicidad + reactivación.
      const existingByDocument = await this.usersService.findByDocumentId(normalizedDocumentId);

      if (existingByDocument) {
        if (existingByDocument.isActive) {
          // Documento en uso por cuenta activa: bloqueo directo.
          throw new ConflictException('errors.documentIdAlreadyExists');
        }

        // Documento pertenece a cuenta inactiva: solo reactivamos si no rompemos unicidad de email.
        const existingByEmail = await this.usersService.findByEmail(normalizedEmail);
        if (existingByEmail && existingByEmail.id !== existingByDocument.id) {
          throw new ConflictException('errors.emailAlreadyExists');
        }

        // 3) Reactivación de cuenta inactiva usando los datos del registro actual.
        const passwordHash = await bcrypt.hash(registerDto.password, 10);
        const reactivatedUser = await this.usersService.reactivateUser(existingByDocument.id, {
          roleId: 2,
          email: normalizedEmail,
          passwordHash,
          name: registerDto.name?.trim() || fallbackName,
          lastName: registerDto.lastName?.trim(),
          avatarUrl: registerDto.avatarUrl?.trim(),
          phone: registerDto.phone?.trim(),
          birthDate: registerDto.birthDate ? new Date(registerDto.birthDate) : undefined,
          gender: registerDto.gender?.trim(),
          documentId: normalizedDocumentId,
          address: registerDto.address?.trim(),
          city: registerDto.city?.trim(),
          postalCode: registerDto.postalCode?.trim(),
          country: registerDto.country?.trim(),
        });

        const accessToken = await this.jwtService.signAsync({
          sub: reactivatedUser.id,
          roleId: reactivatedUser.roleId,
          email: reactivatedUser.email,
        });

        return this.buildAuthResponse(reactivatedUser, accessToken);
      }
    }

    // 4) Alta normal: validamos unicidad de email y creamos usuario nuevo.
    const existingUser = await this.usersService.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('errors.emailAlreadyExists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      roleId: 2,
      email: normalizedEmail,
      passwordHash,
      name: registerDto.name?.trim() || fallbackName,
      lastName: registerDto.lastName?.trim(),
      avatarUrl: registerDto.avatarUrl?.trim(),
      phone: registerDto.phone?.trim(),
      birthDate: registerDto.birthDate ? new Date(registerDto.birthDate) : undefined,
      gender: registerDto.gender?.trim(),
      documentId: normalizedDocumentId,
      address: registerDto.address?.trim(),
      city: registerDto.city?.trim(),
      postalCode: registerDto.postalCode?.trim(),
      country: registerDto.country?.trim(),
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      roleId: user.roleId,
      email: user.email,
    });

    return this.buildAuthResponse(user, accessToken);
  }

  async me(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

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

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    // Cargamos usuario con hash incluido porque es un flujo sensible de seguridad.
    const user = await this.usersService.findByIdForAuth(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    // Validamos la contraseña actual antes de permitir el cambio.
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Guardamos la nueva contraseña en formato hash.
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersService.updatePasswordHash(user.id, newPasswordHash);

    return { success: true };
  }
}
