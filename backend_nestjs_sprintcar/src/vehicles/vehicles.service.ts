import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleEntity } from './vehicle.entity';
import { VehicleStatus } from './vehicle-status.enum';
import { ReservationEntity } from '../reservations/reservation.entity';
import { ReservationStatus } from '../reservations/reservation-status.enum';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(VehicleEntity)
    private readonly vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(ReservationEntity)
    private readonly reservationsRepository: Repository<ReservationEntity>,
  ) {}

  private mapVehicleResponse(vehicle: VehicleEntity) {
    // Mapeo explícito para controlar el contrato de salida del API.
    return {
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      category: vehicle.category ?? undefined,
      pricePerDay: Number(vehicle.pricePerDay),
      mileage: vehicle.mileage ?? undefined,
      color: vehicle.color ?? undefined,
      fuel: vehicle.fuel ?? undefined,
      status: vehicle.status,
      isActive: vehicle.isActive,
    };
  }

  async listAdmin() {
    const vehicles = await this.vehiclesRepository.find({
      order: { brand: 'ASC', model: 'ASC' },
    });

    return vehicles.map((vehicle) => this.mapVehicleResponse(vehicle));
  }

  async listAvailable() {
    // Este listado lo puede consumir cualquier usuario autenticado para reservar.
    const vehicles = await this.vehiclesRepository.find({
      where: {
        isActive: true,
        status: VehicleStatus.AVAILABLE,
      },
      order: { brand: 'ASC', model: 'ASC' },
    });

    return vehicles.map((vehicle) => this.mapVehicleResponse(vehicle));
  }

  /**
   * Lista vehículos activos sin reservas que se solapen en el rango de fechas indicado.
   * 
   * Útil para que el usuario vea qué vehículos puede reservar en un período específico.
   * 
   * Funciona en dos pasos:
   * 1. Valida que las fechas tengan formato DD/MM/YYYY correcto
   * 2. Consulta BD para cada vehículo si hay reservas conflictivas en ese rango
   *
   * @param startDateStr - Fecha de inicio en formato DD/MM/YYYY
   * @param endDateStr - Fecha de fin en formato DD/MM/YYYY
   * @returns Lista de vehículos disponibles en ese rango, ordenados por marca
   */
  async listAvailableForDateRange(startDateStr: string, endDateStr: string) {
    // Regex que valida el formato DD/MM/YYYY.
    const DATE_DDMMYYYY_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;

    // Paso 1: Validamos que ambas fechas cumplan el formato requerido.
    if (!DATE_DDMMYYYY_REGEX.test(startDateStr) || !DATE_DDMMYYYY_REGEX.test(endDateStr)) {
      throw new BadRequestException('errors.invalidDateFormat');
    }

    // Función auxiliar para convertir DD/MM/YYYY a Date UTC.
    const parseBusinessDate = (value: string): Date => {
      const [day, month, year] = value.split('/').map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    };

    // Convertimos las fechas al tipo Date.
    const startDate = parseBusinessDate(startDateStr);
    const endDate = parseBusinessDate(endDateStr);

    // Aseguramos que la lógica es correcta: fin >= inicio.
    if (endDate < startDate) {
      throw new BadRequestException('errors.endDateBeforeStartDate');
    }

    // Paso 2: Obtenemos solo vehículos activos y en estado DISPONIBLE.
    // Esto evita mostrar vehículos marcados como NO_DISPONIBLE por administración.
    const allVehicles = await this.vehiclesRepository.find({
      where: {
        isActive: true,
        status: VehicleStatus.AVAILABLE,
      },
    });

    // Filtramos los vehículos que NO tienen reservas solapadas en el rango solicitado.
    const availableVehicles: VehicleEntity[] = [];

    for (const vehicle of allVehicles) {
      // Para cada vehículo, verificamos si hay conflictos de reserva en el rango.
      const hasOverlap = await this.checkOverlapingReservations(
        vehicle.id,
        startDate,
        endDate,
      );

      // Si no hay solapamiento, el vehículo está disponible para ese rango.
      if (!hasOverlap) {
        availableVehicles.push(vehicle);
      }
    }

    // Devolvemos los vehículos disponibles ordenados alfabéticamente por marca.
    return availableVehicles
      .sort((a, b) => a.brand.localeCompare(b.brand))
      .map((vehicle) => this.mapVehicleResponse(vehicle));
  }

  /**
   * Verifica si un vehículo tiene reservas activas (ni canceladas ni rechazadas) en un rango de fechas.
   * 
   * Usa una query de BD para contar cuántas reservas activas se solapan con el rango propuesto.
   * Dos períodos se solapan si: startRes <= endPropuesto AND endRes >= startPropuesto.
   * 
   * @returns true si hay al menos una reserva activa solapada, false si está libre
   */
  private async checkOverlapingReservations(
    vehicleId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    // Estados que no bloquean disponibilidad para el rango consultado.
    const nonBlockingStatuses = [
      ReservationStatus.CANCELLED,
      ReservationStatus.REJECTED,
    ];

    // Contamos reservas activas que se solapen con el rango de fechas solicitado.
    // Una reserva se solapa si sus fechas interseccionan con el rango.
    const count = await this.reservationsRepository
      .createQueryBuilder('r')
      .where('r.vehicleId = :vehicleId', { vehicleId })
      .andWhere('r.status NOT IN (:...nonBlockingStatuses)', { nonBlockingStatuses })
      .andWhere('r.startDate <= :endDate', { endDate })
      .andWhere('r.endDate >= :startDate', { startDate })
      .getCount();

    // Si hay al menos una reserva solapada, devolvemos true.
    return count > 0;
  }

  async create(createVehicleDto: CreateVehicleDto) {
    const normalizedPlate = createVehicleDto.licensePlate.trim().toUpperCase();

    const existingVehicle = await this.vehiclesRepository.findOne({
      where: { licensePlate: normalizedPlate },
    });

    if (existingVehicle) {
      throw new ConflictException('errors.vehicleLicensePlateAlreadyExists');
    }

    const vehicle = this.vehiclesRepository.create({
      licensePlate: normalizedPlate,
      brand: createVehicleDto.brand.trim(),
      model: createVehicleDto.model.trim(),
      year: createVehicleDto.year,
      category: createVehicleDto.category?.trim() || null,
      pricePerDay: createVehicleDto.pricePerDay.toFixed(2),
      mileage: createVehicleDto.mileage ?? null,
      color: createVehicleDto.color?.trim() || null,
      fuel: createVehicleDto.fuel?.trim() || null,
      status: createVehicleDto.status ?? VehicleStatus.AVAILABLE,
      isActive: true,
    });

    const savedVehicle = await this.vehiclesRepository.save(vehicle);
    return this.mapVehicleResponse(savedVehicle);
  }

  async update(vehicleId: number, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id: vehicleId } });

    if (!vehicle) {
      throw new NotFoundException('errors.vehicleNotFound');
    }

    if (updateVehicleDto.licensePlate) {
      const normalizedPlate = updateVehicleDto.licensePlate.trim().toUpperCase();
      const existingVehicle = await this.vehiclesRepository.findOne({
        where: { licensePlate: normalizedPlate },
      });

      if (existingVehicle && existingVehicle.id !== vehicle.id) {
        throw new ConflictException('errors.vehicleLicensePlateAlreadyExists');
      }

      vehicle.licensePlate = normalizedPlate;
    }

    if (typeof updateVehicleDto.brand !== 'undefined') {
      vehicle.brand = updateVehicleDto.brand.trim();
    }

    if (typeof updateVehicleDto.model !== 'undefined') {
      vehicle.model = updateVehicleDto.model.trim();
    }

    if (typeof updateVehicleDto.year !== 'undefined') {
      vehicle.year = updateVehicleDto.year;
    }

    if (typeof updateVehicleDto.category !== 'undefined') {
      vehicle.category = updateVehicleDto.category?.trim() || null;
    }

    if (typeof updateVehicleDto.pricePerDay !== 'undefined') {
      vehicle.pricePerDay = updateVehicleDto.pricePerDay.toFixed(2);
    }

    if (typeof updateVehicleDto.mileage !== 'undefined') {
      vehicle.mileage = updateVehicleDto.mileage ?? null;
    }

    if (typeof updateVehicleDto.color !== 'undefined') {
      vehicle.color = updateVehicleDto.color?.trim() || null;
    }

    if (typeof updateVehicleDto.fuel !== 'undefined') {
      vehicle.fuel = updateVehicleDto.fuel?.trim() || null;
    }

    if (typeof updateVehicleDto.status !== 'undefined') {
      vehicle.status = updateVehicleDto.status;
    }

    const savedVehicle = await this.vehiclesRepository.save(vehicle);
    return this.mapVehicleResponse(savedVehicle);
  }

  async deactivate(vehicleId: number) {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id: vehicleId } });

    if (!vehicle) {
      throw new NotFoundException('errors.vehicleNotFound');
    }

    // Baja lógica para no perder trazabilidad de reservas históricas.
    vehicle.isActive = false;
    vehicle.status = VehicleStatus.UNAVAILABLE;

    const savedVehicle = await this.vehiclesRepository.save(vehicle);
    return this.mapVehicleResponse(savedVehicle);
  }
}
