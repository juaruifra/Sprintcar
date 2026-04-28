import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReservationEntity } from '../reservations/reservation.entity';
import { UserEntity } from '../users/user.entity';
import { VehicleEntity } from '../vehicles/vehicle.entity';
import { IncidentCommentEntity } from './incident-comment.entity';
import { IncidentEntity } from './incident.entity';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncidentEntity,
      IncidentCommentEntity,
      ReservationEntity,
      VehicleEntity,
      UserEntity,
    ]),
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService, RolesGuard],
})
export class IncidentsModule {}
