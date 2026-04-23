import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../auth/guards/roles.guard';
import { VehicleEntity } from './vehicle.entity';
import { ReservationEntity } from '../reservations/reservation.entity';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleEntity, ReservationEntity])],
  controllers: [VehiclesController],
  providers: [VehiclesService, RolesGuard],
  exports: [VehiclesService, TypeOrmModule],
})
export class VehiclesModule {}
