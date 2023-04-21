import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeOrmAsyncConfig } from '../config/typeorm.config';
import { bookingsModuleConfig } from './bookings.module';

describe('bookings', () => {
  let module: TestingModule;
  let app: INestApplication;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      ...bookingsModuleConfig,
      imports: [
        TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
        ...bookingsModuleConfig.imports,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    // essential so that it releases the resources
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
  });

  it(`GET /bookings/service - get available appointments for all calenders`, async () => {
    const response = await request(app.getHttpServer())
      .get('/bookings/service')
      .expect(200);

    // Test for the existence of the required fields in the response
    expect(response.body[0]).toHaveProperty('serviceId');
    expect(response.body[0]).toHaveProperty('serviceName');
    expect(response.body[0]).toHaveProperty('slots');

    // Test if the slots array has at least one element
    expect(response.body[0].slots.length).toBeGreaterThanOrEqual(1);

    // Test for the existence of required fields in the first slot
    const firstSlot = response.body[0].slots[0];
    expect(firstSlot).toHaveProperty('start');
    expect(firstSlot).toHaveProperty('end');

    // Test if the start and end dates are valid date strings
    const startDate = new Date(firstSlot.start);
    const endDate = new Date(firstSlot.end);
    expect(startDate.toString()).not.toEqual('Invalid Date');
    expect(endDate.toString()).not.toEqual('Invalid Date');

    // Test if the end date is greater than the start date
    expect(endDate.getTime()).toBeGreaterThan(startDate.getTime());
  });

  it('POST /bookings/service/appointment/:serviceId - Successfully book appointment', async () => {
    const availableSlots = await request(app.getHttpServer())
      .get('/bookings/service')
      .expect(200);

    const serviceId = availableSlots.body[0].serviceId;
    const appointmentData = {
      startTime: availableSlots.body[0].slots[0].start,
      endTime: availableSlots.body[0].slots[0].end,
      clients: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      ],
    };

    console.log(appointmentData);
    const response = await request(app.getHttpServer())
      .post(`/bookings/service/appointment/${serviceId}`)
      .send(appointmentData)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('msg');
    expect(response.body.status).toEqual(200);
    expect(response.body.msg).toEqual('success');
  });

  it('POST /bookings/service/appointment/:serviceId - Fail to book appointment due to max clients limit', async () => {
    // Add logic to create bookings that reach the max clients limit
    const availableSlots = await request(app.getHttpServer())
      .get('/bookings/service')
      .expect(200);

    const serviceId = availableSlots.body[0].serviceId;
    const appointmentData = {
      startTime: availableSlots.body[0].slots[0].start,
      endTime: availableSlots.body[0].slots[0].end,
      clients: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      ],
    };

    await request(app.getHttpServer())
      .post(`/bookings/service/appointment/${serviceId}`)
      .send(appointmentData)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);
  });

  it('POST /bookings/service/appointment/:serviceId - Fail to book appointment due to requested slot falls during a break', async () => {
    // Fail to book appointment due to requested slot falls during a break

    const startTime = new Date();
    startTime.setHours(12);
    startTime.setMinutes(10);

    const endTime = new Date();
    endTime.setHours(12);
    endTime.setMinutes(40);

    const serviceId = 1;
    const appointmentData = {
      startTime: startTime,
      endTime: endTime,
      clients: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post(`/bookings/service/appointment/${serviceId}`)
      .send(appointmentData)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    expect(response.body.statusCode).toEqual(400);
    expect(response.body.message).toEqual(
      'Requested slot falls during a break',
    );
  });

  it('POST /bookings/service/appointment/:serviceId - Fail to book appointment due to requested slot falls on a planned off date and time duration', async () => {
    // Fail to book appointment due to requested slot falls on a planned off date and time duration

    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 3);

    const endTime = new Date(startTime);
    endTime.setDate(startTime.getDate() + 1);

    const serviceId = 1;
    const appointmentData = {
      startTime: startTime,
      endTime: endTime,
      clients: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post(`/bookings/service/appointment/${serviceId}`)
      .send(appointmentData)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    expect(response.body.statusCode).toEqual(400);
    expect(response.body.message).toEqual(
      'Requested slot falls on a planned off date and time duration',
    );
  });

  it('POST /bookings/service/appointment/:serviceId - Fail to book appointment due to requested slot is not within bookable calendar', async () => {
    // Fail to book appointment due to requested slot is not within bookable calendar
    // this is basically sunday

    const startTime = new Date();
    const currentDay = startTime.getDay(); // Get the current day of the week (0-6)
    const daysToSunday = currentDay; // Calculate the difference between the current day and Sunday
    startTime.setDate(startTime.getDate() - daysToSunday); // Set the day to the nearest past Sunday

    // Reset the time to midnight (start of the day)
    startTime.setHours(0, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(23);

    const serviceId = 1;
    const appointmentData = {
      startTime: startTime,
      endTime: endTime,
      clients: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post(`/bookings/service/appointment/${serviceId}`)
      .send(appointmentData)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    expect(response.body.statusCode).toEqual(400);
    expect(response.body.message).toEqual(
      'Requested slot is not within bookable calendar',
    );
  });
});
