import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

// Tipo mínimo del archivo que necesitamos para el flujo de avatar.
type UploadedAvatarFile = {
  mimetype: string;
  buffer: Buffer;
};

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async me(@Req() request: AuthRequest) {
    // Devolvemos el perfil del usuario que viene en el token JWT.
    return this.usersService.getProfileById(request.user.sub);
  }

  @Put('me')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  async updateMe(
    @Req() request: AuthRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    // Actualizamos solo los campos enviados en el body.
    return this.usersService.updateProfile(request.user.sub, updateProfileDto);
  }

  @Post('me/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ], {
      // Usamos memoria para enviar el binario directamente a Supabase Storage.
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['avatar'],
    },
  })
  @ApiOperation({ summary: 'Subir avatar del usuario autenticado' })
  async uploadAvatar(
    @Req() request: AuthRequest,
    @UploadedFiles()
    files: {
      avatar?: UploadedAvatarFile[];
      file?: UploadedAvatarFile[];
    },
  ) {
    const uploadedFile = files?.avatar?.[0] ?? files?.file?.[0];

    if (!uploadedFile) {
      throw new BadRequestException('errors.fileNotProvided');
    }

    // Subimos el archivo al bucket de Supabase y guardamos la URL pública.
    return this.usersService.uploadAvatar(request.user.sub, uploadedFile);
  }

  @Delete('me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar avatar del usuario autenticado' })
  async deleteAvatar(@Req() request: AuthRequest) {
    // No borramos el fichero remoto en esta fase; limpiamos referencia en BD.
    return this.usersService.deleteAvatar(request.user.sub);
  }
}
