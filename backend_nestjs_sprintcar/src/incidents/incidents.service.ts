import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { ReservationEntity } from '../reservations/reservation.entity';
import { UserEntity } from '../users/user.entity';
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
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  // Construye la respuesta enriquecida con datos de vehículo y usuario reportador.
  private mapIncidentResponse(
    incident: IncidentEntity,
    vehicle?: VehicleEntity | null,
    reporter?: UserEntity | null,
  ) {
    return {
      id: incident.id,
      reservationId: incident.reservationId,
      vehicleId: incident.vehicleId,
      reportedByUserId: incident.reportedByUserId,
      description: incident.description,
      status: incident.status,
      createdAt: incident.createdAt.toISOString(),
      resolvedAt: incident.resolvedAt?.toISOString() ?? null,
      resolvedByUserId: incident.resolvedByUserId ?? null,
      vehicle: vehicle
        ? {
            id: vehicle.id,
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model,
          }
        : null,
      reporter: reporter
        ? {
            id: reporter.id,
            name: reporter.name,
            lastName: reporter.lastName,
            email: reporter.email,
          }
        : null,
    };
  }

  // Carga vehículos y usuarios relacionados a un lote de incidencias y las enriquece.
  private async enrichIncidents(incidents: IncidentEntity[]) {
    if (incidents.length === 0) return [];

    const vehicleIds = Array.from(new Set(incidents.map((i) => Number(i.vehicleId))));
    const reporterIds = Array.from(new Set(incidents.map((i) => Number(i.reportedByUserId))));

    const [vehicles, reporters] = await Promise.all([
      this.vehiclesRepository.find({ where: { id: In(vehicleIds) } }),
      this.usersRepository.find({ where: { id: In(reporterIds) } }),
    ]);

    const vehicleMap = new Map(vehicles.map((v) => [Number(v.id), v]));
    const reporterMap = new Map(reporters.map((u) => [Number(u.id), u]));

    return incidents.map((i) =>
      this.mapIncidentResponse(
        i,
        vehicleMap.get(Number(i.vehicleId)) ?? null,
        reporterMap.get(Number(i.reportedByUserId)) ?? null,
      ),
    );
  }

  // Cualquier usuario autenticado puede reportar una incidencia sobre una reserva.
  // La reserva debe existir. Si el usuario no es admin (roleId !== 1),
  // la reserva debe pertenecerle.
  async create(request: AuthRequest, dto: CreateIncidentDto) {
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

    const saved = await this.incidentsRepository.save(incident);

    const [vehicle, reporter] = await Promise.all([
      this.vehiclesRepository.findOne({ where: { id: saved.vehicleId } }),
      this.usersRepository.findOne({ where: { id: saved.reportedByUserId } }),
    ]);

    return this.mapIncidentResponse(saved, vehicle ?? null, reporter ?? null);
  }

  // Incidencias del usuario autenticado.
  // Las abiertas aparecen primero; dentro de cada estado, las más recientes arriba.
  async listMy(request: AuthRequest) {
    const incidents = await this.incidentsRepository.find({
      where: { reportedByUserId: request.user.sub },
      // ABIERTA < RESUELTA alfabéticamente → ASC pone primero las abiertas.
      order: { status: 'ASC', createdAt: 'DESC' },
    });

    return this.enrichIncidents(incidents);
  }

  // Listado admin con filtro de estado, búsqueda (descripción + vehículo + usuario) y paginación.
  async listAdmin(options: AdminListOptions) {
    const { status, search, page, limit } = options;

    // Usamos nombres de tabla (string) en lugar de clases de entidad para los JOINs de
    // búsqueda. Pasar clases de entidad a leftJoin causa que TypeORM falle al resolver
    // los metadatos durante createOrderByCombinedWithSelectExpression con getMany().
    const qb = this.incidentsRepository
      .createQueryBuilder('i')
      .leftJoin('vehicles', 'v', 'v.id = i.vehicle_id')
      .leftJoin('users', 'u', 'u.id = i.reported_by_user_id');

    if (status) {
      qb.andWhere('i.status = :status', { status });
    }

    if (search) {
      const normalized = `%${search.trim().toLowerCase()}%`;
      qb.andWhere(
        "(LOWER(i.description) LIKE :s OR LOWER(COALESCE(v.license_plate, '')) LIKE :s OR LOWER(COALESCE(v.brand, '')) LIKE :s OR LOWER(COALESCE(v.model, '')) LIKE :s OR LOWER(COALESCE(u.name, '')) LIKE :s OR LOWER(COALESCE(u.last_name, '')) LIKE :s OR LOWER(COALESCE(u.email, '')) LIKE :s)",
        { s: normalized },
      );
    }

    // Las pendientes más antiguas (mayor urgencia) van primero; resto historial descendente.
    if (status === IncidentStatus.OPEN) {
      qb.orderBy('i.createdAt', 'ASC');
    } else {
      qb.orderBy('i.createdAt', 'DESC');
    }

    const total = await qb.clone().getCount();
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);

    const incidents = await qb
      .skip((safePage - 1) * limit)
      .take(limit)
      .getMany();

    const enrichedItems = await this.enrichIncidents(incidents);

    // Contadores globales por estado (sin filtro de página).
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
      items: enrichedItems,
      page: safePage,
      limit,
      total,
      totalPages,
      counts,
    };
  }

  // Solo admin puede resolver una incidencia.
  // Al resolver: cambia estado a RESUELTA y restaura el vehículo a DISPONIBLE.
  async resolve(request: AuthRequest, incidentId: number) {
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

    const [vehicle, reporter] = await Promise.all([
      this.vehiclesRepository.findOne({ where: { id: incident.vehicleId } }),
      this.usersRepository.findOne({ where: { id: incident.reportedByUserId } }),
    ]);

    return this.mapIncidentResponse(incident, vehicle ?? null, reporter ?? null);
  }
}
