import { In, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { AppointmentInputDto } from './dto/appointment-input.dto';
import { Booking } from './entities/booking.entity';
import { User } from './entities/user.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    //
  }

  async getServices() {
    const services = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.weeklySchedules', 'weeklySchedule')
      .leftJoinAndSelect('service.breaks', 'breaks')
      .leftJoinAndSelect('service.plannedOffDates', 'plannedOffDates')
      .leftJoinAndSelect('service.configurations', 'configurations')
      .leftJoinAndSelect('service.bookings', 'bookings')
      .getMany();

    const availableSlots = services.map((service) => {
      const {
        breaks,
        plannedOffDates,
        configurations,
        weeklySchedules,
        bookings,
      } = service;

      const slots = [];

      if (!weeklySchedules) {
        throw new NotImplementedException(
          'Weekly schedules are not implemented',
        );
      }

      for (const schedule of weeklySchedules) {
        const dayOfTheWeek = schedule.dayOfTheWeek;

        const startTime = new Date(schedule.startTime);
        const endTime = new Date(schedule.endTime);

        startTime.setDate(startTime.getDate() + dayOfTheWeek);
        endTime.setDate(endTime.getDate() + dayOfTheWeek);

        while (startTime < endTime) {
          const slotStart = new Date(startTime);
          startTime.setMinutes(startTime.getMinutes() + service.duration);

          const slotEnd = new Date(startTime);
          startTime.setMinutes(
            startTime.getMinutes() + service.cleanupDuration,
          );

          slots.push({
            start: slotStart,
            end: slotEnd,
          });
        }
      }

      const filteredSlots = slots.filter((slot) => {
        // removing slots that already have maxClients
        const sameTimeBookings = bookings?.filter(
          (booking) =>
            new Date(booking.bookingStartTime).getTime() ===
              new Date(slot.start).getTime() &&
            new Date(booking.bookingEndTime).getTime() ===
              new Date(slot.end).getTime(),
        );

        if (
          configurations?.length &&
          sameTimeBookings &&
          sameTimeBookings.length >= configurations[0].maxClients
        ) {
          return false;
        }

        const slotStartTime = new Date(
          0,
          0,
          0,
          slot.start.getHours(),
          slot.start.getMinutes(),
        );
        const slotEndTime = new Date(
          0,
          0,
          0,
          slot.end.getHours(),
          slot.end.getMinutes(),
        );

        // filter out time slots that fall within any break
        const isWithinBreak = breaks?.some((br) => {
          const breakStartTime = new Date(
            0,
            0,
            0,
            br.startTime.getHours(),
            br.startTime.getMinutes(),
          );
          const breakEndTime = new Date(
            0,
            0,
            0,
            br.endTime.getHours(),
            br.endTime.getMinutes(),
          );
          return slotStartTime >= breakStartTime && slotEndTime <= breakEndTime;
        });

        if (isWithinBreak) {
          return false;
        }

        // filter out time slots that fall within any planned off date
        const isWithinPlannedOffDate = plannedOffDates?.some((plannedOff) => {
          const plannedOffStartTime = new Date(plannedOff.startTime);
          const plannedOffEndTime = new Date(plannedOff.endTime);
          return (
            slot.start >= plannedOffStartTime && slot.end <= plannedOffEndTime
          );
        });
        if (isWithinPlannedOffDate) {
          return false;
        }

        // Filter slots based on the maxDaysInFuture configuration
        const today = new Date();
        const maxDate = new Date(today);
        maxDate.setDate(
          maxDate.getDate() +
            (configurations && configurations.length
              ? configurations[0].maxDaysInFuture
              : 0),
        );
        if (slot.start > maxDate) {
          return false;
        }

        return true;
      });

      return {
        serviceId: service.id,
        serviceName: service.name,
        slots: filteredSlots.map((slot) => ({
          start: slot.start,
          end: slot.end,
        })),
      };
    });

    return availableSlots;
  }

  async addAppointment(
    serviceId: number,
    appointmentData: AppointmentInputDto,
  ) {
    if (!serviceId) {
      throw new NotFoundException('Service not found');
    }

    // Validate the service
    const service = await this.serviceRepository.findOne({
      where: {
        id: serviceId,
      },
      relations: [
        'breaks',
        'plannedOffDates',
        'weeklySchedules',
        'configurations',
      ],
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const { breaks, configurations, plannedOffDates, weeklySchedules } =
      service;

    const { startTime, endTime, clients } = appointmentData;

    // if client sends more than configured amount then throw error since it becomes a race condition which is not mentioned
    if (configurations && clients.length > configurations[0].maxClients) {
      throw new BadRequestException(
        'Failed to set booking, client amount is invalid for single time slot ',
      );
    }

    const existingBooking = await this.bookingRepository
      .createQueryBuilder('booking')
      .where(
        'booking.serviceId = :serviceId AND booking.bookingStartTime = :bookingStartTime AND booking.bookingEndTime = :bookingEndTime ',
        {
          serviceId,
          bookingStartTime: new Date(startTime),
          bookingEndTime: new Date(endTime),
        },
      )
      .getMany();

    if (
      existingBooking &&
      configurations?.length &&
      existingBooking.length >= configurations[0].maxClients
    ) {
      // check if this booking has more than max client
      throw new BadRequestException('Already at max clients limit');
    }

    const startingDate = new Date(startTime);
    const endingDate = new Date(endTime);

    const startingHours = new Date(
      0,
      0,
      0,
      startingDate.getHours(),
      startingDate.getMinutes(),
    );

    const endingHours = new Date(
      0,
      0,
      0,
      endingDate.getHours(),
      endingDate.getMinutes(),
    );

    // check if the time ends up colliding with breaks
    if (breaks) {
      for (const br of breaks) {
        const breakStart = new Date(
          0,
          0,
          0,
          br.startTime.getHours(),
          br.startTime.getMinutes(),
        );

        const breakEnd = new Date(
          0,
          0,
          0,
          br.endTime.getHours(),
          br.endTime.getMinutes(),
        );

        if (
          (startingHours >= breakStart && startingHours < breakEnd) ||
          (endingHours > breakStart && endingHours <= breakEnd) ||
          (startingHours >= breakStart && endingHours <= breakEnd)
        ) {
          throw new BadRequestException('Requested slot falls during a break');
        }
      }
    }

    // Check if the requested slot falls on a planned off date and time duration
    if (plannedOffDates) {
      for (const plannedOffDate of plannedOffDates) {
        const plannedOffStart = new Date(plannedOffDate.startTime);
        const plannedOffEnd = new Date(plannedOffDate.endTime);

        if (
          (startingDate >= plannedOffStart && startingDate < plannedOffEnd) ||
          (endingDate > plannedOffStart && endingDate <= plannedOffEnd) ||
          (startingDate >= plannedOffStart && endingDate <= plannedOffEnd)
        ) {
          throw new BadRequestException(
            'Requested slot falls on a planned off date and time duration',
          );
        }
      }
    }

    const dayOfTheWeek = new Date(startingDate).getDay() - 1;

    const currentWeeklySchedule = weeklySchedules?.find(
      (schedule) => schedule.dayOfTheWeek === dayOfTheWeek,
    );

    // if the slot is not in working day
    if (!currentWeeklySchedule) {
      throw new BadRequestException(
        'Requested slot is not within bookable calendar',
      );
    }

    const scheduleStartTime = new Date(
      0,
      0,
      0,
      currentWeeklySchedule.startTime.getHours(),
      currentWeeklySchedule.startTime.getMinutes(),
    );
    const scheduleEndTime = new Date(
      0,
      0,
      0,
      currentWeeklySchedule.endTime.getHours(),
      currentWeeklySchedule.endTime.getMinutes(),
    );

    // if the slot is not within working hours
    if (startingHours < scheduleStartTime || endingHours > scheduleEndTime) {
      throw new BadRequestException(
        'Requested slot is not valid within working hours',
      );
    }

    const slotInterval = service.duration;
    const slotIntervalMilliseconds = slotInterval * 60 * 1000;

    // if the slot was set for more than the duration it was suppose e.g 10 minutes slot but client sent 30 minutes
    const timeSlotDuration = Math.abs(
      endingHours.getTime() - startingHours.getTime(),
    );
    if (timeSlotDuration != slotIntervalMilliseconds) {
      throw new BadRequestException(
        'Requested slot is added because the duration is invalid',
      );
    }

    // if time goes like 8:02 rather than 8:10 assuming service duration is 10 minutes
    const timeDiff =
      new Date(endTime).getTime() - new Date(startTime).getTime();

    if (timeDiff - slotIntervalMilliseconds !== 0) {
      throw new BadRequestException(
        'Requested slot does not align with slot intervals',
      );
    }

    // Find existing users
    const existingUsers = await this.userRepository.find({
      where: {
        email: In(clients.map((c) => c.email)),
      },
    });

    // Filter clients that are not in the existing users
    const newClients = clients.filter(
      (c) => !existingUsers.map((u) => u.email).includes(c.email),
    );

    // Create new users for clients not found in the database
    const newUsers = newClients.map((c) => {
      const user = new User();
      user.firstName = c.firstName;
      user.lastName = c.lastName;
      user.email = c.email;
      return user;
    });

    // Save new users and merge with existing users
    const savedNewUsers = await this.userRepository.save(newUsers);
    const allUsers = [...existingUsers, ...savedNewUsers];

    // Create bookings for each user
    const bookings: Booking[] = [];
    for (const user of allUsers) {
      const booking = new Booking();
      booking.bookingStartTime = startingDate;
      booking.bookingEndTime = endingDate;
      booking.serviceId = serviceId;
      booking.userId = user.id;
      bookings.push(booking);
    }

    // Save the bookings in the repository
    await this.bookingRepository.save(bookings);

    // TODO Check if the booking time falls between a cleanup break

    return {
      status: 200,
      msg: 'success',
    };
  }
}
