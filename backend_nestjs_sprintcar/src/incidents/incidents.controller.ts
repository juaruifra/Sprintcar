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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { AdminIncidentsResponseDto, IncidentResponseDto } from './dto/incident-response.dto';
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
  @ApiResponse({ status: 201, description: 'Incidencia creada', type: IncidentResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos o reserva no encontrada' })
  @ApiResponse({ status: 403, description: 'La reserva no pertenece al usuario' })
  async create(@Req() request: AuthRequest, @Body() dto: CreateIncidentDto) {
    return this.incidentsService.create(request, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Listar incidencias del usuario autenticado (abiertas primero)' })
  @ApiResponse({ status: 200, description: 'Lista de incidencias propias', type: [IncidentResponseDto] })
  async listMy(@Req() request: AuthRequest) {
    return this.incidentsService.listMy(request);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(1)
  @ApiOperation({ summary: 'Listar incidencias (admin) con filtro de estado, búsqueda y paginación' })
  @ApiQuery({ name: 'status', required: false, enum: [...Object.values(IncidentStatus), 'all'], description: 'Filtrar por estado; omitir o "all" para ver todas' })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda libre: descripción, matrícula, marca, modelo, nombre o email del reportador' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página (por defecto 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página, máx 50 (por defecto 10)', example: 10 })
  @ApiResponse({ status: 200, description: 'Página de incidencias con contadores', type: AdminIncidentsResponseDto })
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
  @ApiOperation({ summary: 'Resolver incidencia (admin) — cambia estado a RESUELTA y restaura el vehículo a DISPONIBLE' })
  @ApiParam({ name: 'id', description: 'ID de la incidencia', example: 1 })
  @ApiResponse({ status: 200, description: 'Incidencia resuelta y vehículo restaurado', type: IncidentResponseDto })
  @ApiResponse({ status: 400, description: 'La incidencia ya está resuelta' })
  @ApiResponse({ status: 404, description: 'Incidencia no encontrada' })
  async resolve(@Req() request: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.incidentsService.resolve(request, id);
  }
}
