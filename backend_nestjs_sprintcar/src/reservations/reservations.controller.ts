import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('reservations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear reserva de un vehículo disponible' })
  async create(
    @Req() request: AuthRequest,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    return this.reservationsService.create(request, createReservationDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Listar reservas del usuario autenticado' })
  async listMy(@Req() request: AuthRequest) {
    return this.reservationsService.listMy(request);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(1)
  @ApiOperation({ summary: 'Listar todas las reservas (solo admin)' })
  async listAdmin() {
    return this.reservationsService.listAdmin();
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(1)
  @ApiOperation({ summary: 'Confirmar una reserva (solo admin)' })
  async confirm(@Req() request: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.confirm(request, id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(1)
  @ApiOperation({ summary: 'Rechazar una reserva (solo admin)' })
  async reject(@Req() request: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.reject(request, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar una reserva existente' })
  async cancel(
    @Req() request: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reservationsService.cancel(request, id);
  }
}
