import { Controller, Get, Param } from '@nestjs/common';

import { BookingService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('calendar/:id')
  async getEventsWithWorkshops(@Param('id') id: number) {
    return this.bookingService.getCalender(id);
  }
}
