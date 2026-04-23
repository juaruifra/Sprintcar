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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
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
  @UseGuards(RolesGuard)
  @Roles(1)
  @ApiOperation({ summary: 'Listar vehículos para gestión admin' })
  async listAdmin() {
    return this.vehiclesService.listAdmin();
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
  @UseGuards(RolesGuard)
  @Roles(1)
  @ApiOperation({ summary: 'Crear vehículo (solo admin)' })
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(1)
  @ApiOperation({ summary: 'Actualizar vehículo (solo admin)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(1)
  @ApiOperation({ summary: 'Dar de baja vehículo (solo admin)' })
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.deactivate(id);
  }
}
