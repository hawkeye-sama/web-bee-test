import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { BookingService } from './bookings.service';
import { AppointmentInputDto } from './dto/appointment-input.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingService: BookingService) {}

  // returns all services and time slots
  @Get('service/')
  async getCalenders() {
    return this.bookingService.getServices();
  }

  // adds appointment
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('service/appointment/:serviceId')
  async addAppointment(
    @Param('serviceId') serviceId: number,
    @Body() appointmentData: AppointmentInputDto,
  ) {
    return this.bookingService.addAppointment(serviceId, appointmentData);
  }
}
