import { Booking } from './entities/booking.entity';
import { BookingService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Break } from './entities/break.entity';
import { Configuration } from './entities/configuration.entity';
import { Module } from '@nestjs/common';
import { PlannedOffDate } from './entities/plannedOff.entity';
import { Service } from './entities/service.entity';
import { TimeSlot } from './entities/timeslot.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

export const bookingsModuleConfig = {
  imports: [
    TypeOrmModule.forFeature([
      TimeSlot,
      Booking,
      Break,
      Configuration,
      PlannedOffDate,
      Service,
      User,
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingService],
};

@Module(bookingsModuleConfig)
export class BookingsModule {}
