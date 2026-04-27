import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { UserEntity } from '../users/user.entity';
import { VehicleEntity } from '../vehicles/vehicle.entity';
import { VehicleStatus } from '../vehicles/vehicle-status.enum';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationEntity } from './reservation.entity';
import { ReservationStatus } from './reservation-status.enum';

const DATE_DDMMYYYY_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;

// Límites de negocio para reservas.
const MAX_RESERVATION_DAYS = 60; // Máximo 60 días de reserva continua.

type AdminListOptions = {
  status?: ReservationStatus;
  search?: string;
  page: number;
  limit: number;
};

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly reservationsRepository: Repository<ReservationEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  private parseBusinessDate(value: string): Date {
    // Validamos que la fecha tenga el formato DD/MM/YYYY que espera el frontend.
    // Si no cumple el formato, lanzamos error con clave i18n para que se traduzca automáticamente.
    if (!DATE_DDMMYYYY_REGEX.test(value)) {
      throw new BadRequestException('errors.invalidDateFormat');
    }

    // Extraemos día, mes y año, y creamos un Date UTC para almacenar sin problemas de zona horaria.
    const [day, month, year] = value.split('/').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  private normalizeDateValue(value: Date | string): Date {
    // TypeORM con MySQL puede devolver columnas `date` como string (YYYY-MM-DD).
    // Normalizamos siempre a objeto Date UTC para evitar errores al formatear.
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string') {
      // Si viene de BD en formato ISO de fecha (YYYY-MM-DD), la convertimos a UTC explícito.
      const [yearStr, monthStr, dayStr] = value.split('-');
      const year = Number(yearStr);
      const month = Number(monthStr);
      const day = Number(dayStr);

      if (year && month && day) {
        return new Date(Date.UTC(year, month - 1, day));
      }

      // Fallback defensivo por si llega otro formato string.
      return new Date(value);
    }

    // Fallback extremo para mantener estabilidad.
    return new Date(value as unknown as string);
  }

  private formatBusinessDate(value: Date | string): string {
    // Convertimos a Date UTC primero para soportar tanto Date como string de BD.
    const normalizedDate = this.normalizeDateValue(value);

    // Si la fecha es inválida/corrupta en BD, devolvemos error controlado.
    // Así evitamos fallos opacos y mantenemos un mensaje consistente hacia frontend.
    if (Number.isNaN(normalizedDate.getTime())) {
      throw new InternalServerErrorException('errors.invalidReservationDateData');
    }

    // Convertimos Date UTC al formato DD/MM/YYYY que entiende el frontend.
    const day = String(normalizedDate.getUTCDate()).padStart(2, '0');
    const month = String(normalizedDate.getUTCMonth() + 1).padStart(2, '0');
    const year = normalizedDate.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  private mapReservationResponse(
    reservation: ReservationEntity,
    vehicle?: VehicleEntity | null,
    user?: UserEntity | null,
  ) {
    // Mapeamos la entidad de BD a un objeto limpio para devolver al frontend.
    // Convertimos las fechas a formato DD/MM/YYYY para consistencia.
    return {
      id: reservation.id,
      userId: reservation.userId,
      vehicleId: reservation.vehicleId,
      startDate: this.formatBusinessDate(reservation.startDate),
      endDate: this.formatBusinessDate(reservation.endDate),
      status: reservation.status,
      statusUpdatedAt: reservation.statusUpdatedAt?.toISOString() ?? null,
      statusUpdatedByUserId: reservation.statusUpdatedByUserId ?? null,
      user: user
        ? {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
          }
        : null,
      vehicle: vehicle
        ? {
            id: vehicle.id,
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model,
            pricePerDay: Number(vehicle.pricePerDay),
            status: vehicle.status,
            isActive: vehicle.isActive,
          }
        : null,
    };
  }

  /**
   * Valida que las fechas cumplan las reglas de negocio de una reserva.
   * 1. La fecha de inicio no puede ser en el pasado (debe ser hoy o después).
   * 2. La duración total no puede exceder MAX_RESERVATION_DAYS (60 días).
   * Si algo no cumple, lanzamos excepción con clave i18n.
   */
  private validateReservationDates(startDate: Date, endDate: Date): void {
    // Obtenemos hoy a las 00:00 UTC para comparar solo la fecha, sin la hora.
    const today = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));

    // Regla 1: no se puede reservar en el pasado.
    if (startDate < today) {
      throw new BadRequestException('errors.startDateInPast');
    }

    // Cálculo de duración: cuántos días hay entre inicio y fin.
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Regla 2: no se puede reservar más de MAX_RESERVATION_DAYS días.
    if (durationDays > MAX_RESERVATION_DAYS) {
      throw new BadRequestException('errors.reservationDurationExceeded');
    }
  }

  /**
   * Verifica si existe alguna reserva activa (ni cancelada ni rechazada) que se solape
   * con el rango de fechas propuesto para un vehículo.
   * 
   * Dos períodos se solapan si: startRes <= endPropuesto AND endRes >= startPropuesto
   * 
   * Opcionalmente filtra por ID de reserva para excluir la reserva que estamos editando.
   */
  private async hasOverlappingReservation(
    vehicleId: number,
    startDate: Date,
    endDate: Date,
    excludeReservationId?: number,
  ): Promise<boolean> {
    // Solo bloquean disponibilidad las reservas en curso del flujo (creada/confirmada).
    const nonBlockingStatuses = [
      ReservationStatus.CANCELLED,
      ReservationStatus.REJECTED,
      ReservationStatus.FINALIZED,
    ];

    // Construimos una query que cuenta reservas activas que se solapen.
    const query = this.reservationsRepository.createQueryBuilder('r')
      .where('r.vehicleId = :vehicleId', { vehicleId })
      .andWhere('r.status NOT IN (:...nonBlockingStatuses)', { nonBlockingStatuses })
      .andWhere('r.startDate <= :endDate', { endDate })
      .andWhere('r.endDate >= :startDate', { startDate });

    // Si pasamos un ID, excluimos esa reserva (útil para ediciones).
    if (excludeReservationId) {
      query.andWhere('r.id != :excludeId', { excludeId: excludeReservationId });
    }

    return (await query.getCount()) > 0;
  }

  private assertAdmin(request: AuthRequest): void {
    // Solo permitimos gestionar estados globales a administradores.
    if (request.user.roleId !== 1) {
      throw new ForbiddenException('errors.adminOnlyAction');
    }
  }

  private assertStatusTransition(
    currentStatus: ReservationStatus,
    nextStatus: ReservationStatus,
  ): void {
    // Definimos transiciones permitidas para mantener un flujo consistente.
    const allowedTransitions: Record<ReservationStatus, ReservationStatus[]> = {
      [ReservationStatus.CREATED]: [
        ReservationStatus.CONFIRMED,
        ReservationStatus.REJECTED,
        ReservationStatus.CANCELLED,
      ],
      [ReservationStatus.CONFIRMED]: [ReservationStatus.CANCELLED, ReservationStatus.FINALIZED],
      [ReservationStatus.REJECTED]: [],
      [ReservationStatus.CANCELLED]: [],
      [ReservationStatus.FINALIZED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new BadRequestException('errors.invalidReservationStatusTransition');
    }
  }

  private async updateStatus(
    request: AuthRequest,
    reservationId: number,
    nextStatus: ReservationStatus,
  ): Promise<ReturnType<typeof this.mapReservationResponse>> {
    // Buscamos la reserva para validar que existe antes de cambiar estado.
    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('errors.reservationNotFound');
    }

    // Validamos que la transición del estado actual al nuevo esté permitida.
    this.assertStatusTransition(reservation.status, nextStatus);

    // Persistimos nuevo estado con trazabilidad de actor y fecha.
    reservation.status = nextStatus;
    reservation.statusUpdatedAt = new Date();
    reservation.statusUpdatedByUserId = request.user.sub;
    const savedReservation = await this.reservationsRepository.save(reservation);

    // Adjuntamos datos relacionados para respuesta consistente con el resto del API.
    const [vehicle, user] = await Promise.all([
      this.vehiclesRepository.findOne({ where: { id: savedReservation.vehicleId } }),
      this.usersRepository.findOne({ where: { id: savedReservation.userId } }),
    ]);

    return this.mapReservationResponse(savedReservation, vehicle ?? null, user ?? null);
  }

  async create(request: AuthRequest, createReservationDto: CreateReservationDto) {
    // Regla crítica: para reservar, el usuario debe tener DNI/NIE informado en su perfil.
    const currentUser = await this.usersRepository.findOne({
      where: { id: request.user.sub },
    });

    if (!currentUser || !currentUser.documentId?.trim()) {
      throw new BadRequestException('errors.documentIdRequiredForReservation');
    }

    // Paso 1: Normalizamos las fechas del formato DD/MM/YYYY a Date (UTC).
    const startDate = this.parseBusinessDate(createReservationDto.startDate);
    const endDate = this.parseBusinessDate(createReservationDto.endDate);

    // Paso 2: Validamos que la fecha fin sea igual o posterior a la fecha inicio.
    if (endDate < startDate) {
      throw new BadRequestException('errors.endDateBeforeStartDate');
    }

    // Paso 3: Aplicamos las reglas de negocio para fechas (no pasadas, duración máxima).
    this.validateReservationDates(startDate, endDate);

    // Paso 4: Verificamos que el vehículo existe y está activo.
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: createReservationDto.vehicleId },
    });

    if (!vehicle || !vehicle.isActive) {
      throw new NotFoundException('errors.vehicleNotFound');
    }

    // Paso 5: Verificamos que el vehículo tiene status AVAILABLE (no reservado ni desactivado).
    if (vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new BadRequestException('errors.vehicleNotAvailable');
    }

    // Paso 6: Verificamos que no hay reservas activas que choquen con nuestras fechas.
    const hasConflict = await this.hasOverlappingReservation(createReservationDto.vehicleId, startDate, endDate);
    if (hasConflict) {
      throw new BadRequestException('errors.vehicleAlreadyReserved');
    }

    // Paso 7: Creamos la reserva en estado CREATED.
    const reservation = this.reservationsRepository.create({
      userId: request.user.sub,
      vehicleId: createReservationDto.vehicleId,
      startDate,
      endDate,
      status: ReservationStatus.CREATED,
      statusUpdatedAt: new Date(),
      statusUpdatedByUserId: request.user.sub,
    });

    // Paso 8: Guardamos la reserva en la BD.
    const savedReservation = await this.reservationsRepository.save(reservation);

    // Paso 9: No modificamos status/isActive del vehículo al reservar.
    // La disponibilidad operativa se gestiona manualmente por admin.

    // Paso 10: Devolvemos la reserva con resumen del vehículo reservado.
    return this.mapReservationResponse(savedReservation, vehicle, currentUser);
  }

  async listMy(request: AuthRequest) {
    // Antes de listar, normalizamos estados vencidos para no depender del frontend.
    await this.finalizeExpiredReservations();

    // Obtenemos todas las reservas del usuario autenticado, ordenadas por ID descendente.
    // El usuario solo ve sus propias reservas (filtro por userId).
    const reservations = await this.reservationsRepository.find({
      where: { userId: request.user.sub },
      order: { startDate: 'DESC', endDate: 'DESC', id: 'DESC' },
    });

    const vehicleIds = Array.from(new Set(reservations.map((reservation) => Number(reservation.vehicleId))));
    const vehicles = vehicleIds.length
      ? await this.vehiclesRepository.find({ where: { id: In(vehicleIds) } })
      : [];
    const vehicleMap = new Map(vehicles.map((vehicle) => [Number(vehicle.id), vehicle]));

    const userIds = Array.from(new Set(reservations.map((reservation) => Number(reservation.userId))));
    const users = userIds.length
      ? await this.usersRepository.find({ where: { id: In(userIds) } })
      : [];
    const userMap = new Map(users.map((user) => [Number(user.id), user]));

    // Convertimos cada reserva al formato que entiende el frontend.
    return reservations.map((reservation) =>
      this.mapReservationResponse(
        reservation,
        vehicleMap.get(Number(reservation.vehicleId)) ?? null,
        userMap.get(Number(reservation.userId)) ?? null,
      ),
    );
  }

  // Ejecuta cada hora para cerrar reservas confirmadas que ya vencieron.
  @Cron('0 * * * *')
  async finalizeExpiredReservations(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.reservationsRepository
      .createQueryBuilder()
      .update(ReservationEntity)
      .set({
        status: ReservationStatus.FINALIZED,
        statusUpdatedAt: new Date(),
        statusUpdatedByUserId: null,
      })
      .where('status = :status', { status: ReservationStatus.CONFIRMED })
      .andWhere('end_date < :today', { today })
      .execute();

    return result.affected ?? 0;
  }

  async listAdmin(options: AdminListOptions) {
    // Antes de responder, cerramos reservas vencidas por seguridad.
    await this.finalizeExpiredReservations();

    const baseQb = this.reservationsRepository
      .createQueryBuilder('r')
      .leftJoin(UserEntity, 'u', 'u.id = r.userId')
      .leftJoin(VehicleEntity, 'v', 'v.id = r.vehicleId');

    const normalizedSearch = options.search?.trim().toLowerCase();
    if (normalizedSearch) {
      const search = `%${normalizedSearch}%`;
      baseQb.andWhere(
        "(CAST(r.id AS CHAR) LIKE :search OR LOWER(COALESCE(u.name, '')) LIKE :search OR LOWER(COALESCE(u.lastName, '')) LIKE :search OR LOWER(COALESCE(u.email, '')) LIKE :search OR LOWER(COALESCE(v.brand, '')) LIKE :search OR LOWER(COALESCE(v.model, '')) LIKE :search OR LOWER(COALESCE(v.licensePlate, '')) LIKE :search)",
        { search },
      );
    }

    if (options.status) {
      baseQb.andWhere('r.status = :status', { status: options.status });
    }

    // Pendientes: más cercanas primero. Resto: historial descendente.
    if (options.status === ReservationStatus.CREATED) {
      baseQb.orderBy('r.startDate', 'ASC').addOrderBy('r.id', 'ASC');
    } else {
      baseQb.orderBy('r.startDate', 'DESC').addOrderBy('r.id', 'DESC');
    }

    const total = await baseQb.clone().getCount();
    const totalPages = Math.max(1, Math.ceil(total / options.limit));
    const page = Math.min(options.page, totalPages);

    const reservations = await baseQb
      .skip((page - 1) * options.limit)
      .take(options.limit)
      .getMany();

    const vehicleIds = Array.from(new Set(reservations.map((reservation) => Number(reservation.vehicleId))));
    const vehicles = vehicleIds.length
      ? await this.vehiclesRepository.find({ where: { id: In(vehicleIds) } })
      : [];
    const vehicleMap = new Map(vehicles.map((vehicle) => [Number(vehicle.id), vehicle]));

    const userIds = Array.from(new Set(reservations.map((reservation) => Number(reservation.userId))));
    const users = userIds.length
      ? await this.usersRepository.find({ where: { id: In(userIds) } })
      : [];
    const userMap = new Map(users.map((user) => [Number(user.id), user]));

    // Contadores por estado para tabs, respetando búsqueda actual.
    const statusesForCount: ReservationStatus[] = [
      ReservationStatus.CREATED,
      ReservationStatus.CONFIRMED,
      ReservationStatus.REJECTED,
      ReservationStatus.CANCELLED,
      ReservationStatus.FINALIZED,
    ];

    const countsEntries = await Promise.all(
      statusesForCount.map(async (status) => {
        const count = await this.reservationsRepository
          .createQueryBuilder('r')
          .leftJoin(UserEntity, 'u', 'u.id = r.userId')
          .leftJoin(VehicleEntity, 'v', 'v.id = r.vehicleId')
          .where('r.status = :status', { status })
          .andWhere(
            normalizedSearch
              ? "(CAST(r.id AS CHAR) LIKE :search OR LOWER(COALESCE(u.name, '')) LIKE :search OR LOWER(COALESCE(u.lastName, '')) LIKE :search OR LOWER(COALESCE(u.email, '')) LIKE :search OR LOWER(COALESCE(v.brand, '')) LIKE :search OR LOWER(COALESCE(v.model, '')) LIKE :search OR LOWER(COALESCE(v.licensePlate, '')) LIKE :search)"
              : '1=1',
            normalizedSearch ? { search: `%${normalizedSearch}%` } : {},
          )
          .getCount();

        return [status, count] as const;
      }),
    );

    const counts = Object.fromEntries(countsEntries) as Record<ReservationStatus, number>;

    return {
      items: reservations.map((reservation) =>
        this.mapReservationResponse(
          reservation,
          vehicleMap.get(Number(reservation.vehicleId)) ?? null,
          userMap.get(Number(reservation.userId)) ?? null,
        ),
      ),
      page,
      limit: options.limit,
      total,
      totalPages,
      counts,
    };
  }

  async confirm(
    request: AuthRequest,
    reservationId: number,
  ): Promise<ReturnType<typeof this.mapReservationResponse>> {
    // Aseguramos que solo admin puede confirmar reservas.
    this.assertAdmin(request);
    return this.updateStatus(request, reservationId, ReservationStatus.CONFIRMED);
  }

  async reject(
    request: AuthRequest,
    reservationId: number,
  ): Promise<ReturnType<typeof this.mapReservationResponse>> {
    // Aseguramos que solo admin puede rechazar reservas.
    this.assertAdmin(request);
    return this.updateStatus(request, reservationId, ReservationStatus.REJECTED);
  }

  /**
   * Cancela una reserva existente.
   *
   * Solo el usuario propietario de la reserva o un administrador pueden cancelarla.
   * No modifica el status operativo del vehículo (eso lo decide administración).
   */
  async cancel(request: AuthRequest, reservationId: number): Promise<ReturnType<typeof this.mapReservationResponse>> {
    // Paso 1: Buscamos la reserva en la BD por su ID.
    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId },
    });

    // Si la reserva no existe, error.
    if (!reservation) {
      throw new NotFoundException('errors.reservationNotFound');
    }

    // Paso 2: Verificamos permisos.
    // Solo el propietario (userId) o un admin (roleId 1) pueden cancelar una reserva.
    if (request.user.sub !== reservation.userId && request.user.roleId !== 1) {
      throw new BadRequestException('errors.unauthorizedCancelReservation');
    }

    // Paso 3: para cancelar usamos la misma validación central de transiciones.
    const savedReservation = await this.updateStatus(request, reservationId, ReservationStatus.CANCELLED);

    // Paso 4: devolvemos la reserva cancelada ya mapeada y trazada.
    return savedReservation;
  }
}
