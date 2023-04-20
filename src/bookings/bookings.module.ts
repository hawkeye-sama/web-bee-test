import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookingsController } from './bookings.controller';
import { BookingService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { Break } from './entities/break.entity';
import { Configuration } from './entities/configuration.entity';
import { PlannedOffDate } from './entities/plannedOff.entity';
import { Service } from './entities/service.entity';
import { User } from './entities/user.entity';
import { WeeklySchedule } from './entities/weeklySchedule.entity';

export const bookingsModuleConfig = {
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      Break,
      Configuration,
      PlannedOffDate,
      Service,
      User,
      WeeklySchedule,
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingService],
};

@Module(bookingsModuleConfig)
export class BookingsModule {}
