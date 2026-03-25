import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('admin')
  @ApiOperation({ summary: 'Listar vehículos para gestión admin' })
  async listAdmin(@Req() request: AuthRequest) {
    return this.vehiclesService.listAdmin(request);
  }

  @Get('available')
  @ApiOperation({
    summary: 'Listar vehículos disponibles para reservar (opcionalmente filtrar por rango de fechas)',
  })
  async listAvailable(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Si proporciona rango de fechas, filtra por disponibilidad en ese período.
    // Si no, devuelve todos los vehículos con status AVAILABLE.
    if (startDate && endDate) {
      return this.vehiclesService.listAvailableForDateRange(startDate, endDate);
    }

    return this.vehiclesService.listAvailable();
  }

  @Post()
  @ApiOperation({ summary: 'Crear vehículo (solo admin)' })
  async create(
    @Req() request: AuthRequest,
    @Body() createVehicleDto: CreateVehicleDto,
  ) {
    return this.vehiclesService.create(request, createVehicleDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar vehículo (solo admin)' })
  async update(
    @Req() request: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(request, id, updateVehicleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Dar de baja vehículo (solo admin)' })
  async deactivate(
    @Req() request: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.vehiclesService.deactivate(request, id);
  }
}
