import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentStatus } from './incident-status.enum';
import { IncidentsService } from './incidents.service';

@ApiTags('incidents')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @ApiOperation({ summary: 'Reportar incidencia vinculada a una reserva' })
  async create(@Req() request: AuthRequest, @Body() dto: CreateIncidentDto) {
    return this.incidentsService.create(request, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Listar incidencias del usuario autenticado' })
  async listMy(@Req() request: AuthRequest) {
    return this.incidentsService.listMy(request);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(1)
  @ApiOperation({ summary: 'Listar incidencias admin con estado, búsqueda y paginación' })
  async listAdmin(
    @Query('status') status?: 'all' | IncidentStatus,
    @Query('search') search?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const page = Math.max(1, Number(pageRaw ?? '1') || 1);
    const limit = Math.min(50, Math.max(1, Number(limitRaw ?? '10') || 10));

    if (status && status !== 'all' && !Object.values(IncidentStatus).includes(status)) {
      throw new BadRequestException('errors.invalidIncidentStatusFilter');
    }

    return this.incidentsService.listAdmin({
      status: status && status !== 'all' ? status : undefined,
      search,
      page,
      limit,
    });
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(1)
  @ApiOperation({ summary: 'Resolver incidencia (admin) — restaura disponibilidad del vehículo' })
  async resolve(@Req() request: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.incidentsService.resolve(request, id);
  }
}
