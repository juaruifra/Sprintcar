import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { ReservationEntity } from '../reservations/reservation.entity';
import { VehicleEntity } from '../vehicles/vehicle.entity';
import { VehicleStatus } from '../vehicles/vehicle-status.enum';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentEntity } from './incident.entity';
import { IncidentStatus } from './incident-status.enum';

type AdminListOptions = {
  status?: IncidentStatus;
  search?: string;
  page: number;
  limit: number;
};

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(IncidentEntity)
    private readonly incidentsRepository: Repository<IncidentEntity>,
    @InjectRepository(ReservationEntity)
    private readonly reservationsRepository: Repository<ReservationEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehiclesRepository: Repository<VehicleEntity>,
  ) {}

  // Cualquier usuario autenticado puede reportar una incidencia sobre una reserva.
  // La reserva debe existir. Si el usuario no es admin (roleId !== 1),
  // la reserva debe pertenecerle.
  async create(request: AuthRequest, dto: CreateIncidentDto): Promise<IncidentEntity> {
    const { sub: userId, roleId } = request.user;

    const reservation = await this.reservationsRepository.findOne({
      where: { id: dto.reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('errors.reservationNotFound');
    }

    const isAdmin = roleId === 1;
    if (!isAdmin && reservation.userId !== userId) {
      throw new ForbiddenException('errors.forbiddenResourceAccess');
    }

    const incident = this.incidentsRepository.create({
      reservationId: reservation.id,
      vehicleId: reservation.vehicleId,
      reportedByUserId: userId,
      description: dto.description,
      status: IncidentStatus.OPEN,
    });

    return this.incidentsRepository.save(incident);
  }

  // Incidencias del usuario autenticado.
  async listMy(request: AuthRequest): Promise<IncidentEntity[]> {
    return this.incidentsRepository.find({
      where: { reportedByUserId: request.user.sub },
      order: { createdAt: 'DESC' },
    });
  }

  // Listado admin con filtro de estado, búsqueda libre y paginación.
  async listAdmin(options: AdminListOptions) {
    const { status, search, page, limit } = options;
    const offset = (page - 1) * limit;

    const qb = this.incidentsRepository
      .createQueryBuilder('i')
      .orderBy('i.created_at', 'DESC')
      .skip(offset)
      .take(limit);

    if (status) {
      qb.andWhere('i.status = :status', { status });
    }

    if (search) {
      qb.andWhere('i.description LIKE :search', { search: `%${search}%` });
    }

    const [items, total] = await qb.getManyAndCount();

    // Contadores por estado para mostrar badges en las pestañas.
    const rawCounts = (await this.incidentsRepository
      .createQueryBuilder('i')
      .select('i.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('i.status')
      .getRawMany()) as { status: string; count: string }[];

    const counts: Record<string, number> = {};
    for (const row of rawCounts) {
      counts[row.status] = Number(row.count);
    }

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      counts,
    };
  }

  // Solo admin puede resolver una incidencia.
  // Al resolver: cambia estado a RESUELTA y restaura el vehículo a DISPONIBLE.
  async resolve(request: AuthRequest, incidentId: number): Promise<IncidentEntity> {
    const incident = await this.incidentsRepository.findOne({ where: { id: incidentId } });

    if (!incident) {
      throw new NotFoundException('errors.incidentNotFound');
    }

    if (incident.status !== IncidentStatus.OPEN) {
      throw new BadRequestException('errors.incidentAlreadyResolved');
    }

    incident.status = IncidentStatus.RESOLVED;
    incident.resolvedAt = new Date();
    incident.resolvedByUserId = request.user.sub;
    await this.incidentsRepository.save(incident);

    // Restaurar el vehículo a disponible para que pueda seguir siendo reservado.
    await this.vehiclesRepository.update(incident.vehicleId, {
      status: VehicleStatus.AVAILABLE,
    });

    return incident;
  }
}
