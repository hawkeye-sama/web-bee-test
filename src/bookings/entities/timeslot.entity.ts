import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Booking } from './booking.entity';
import { Service } from './service.entity';

@Entity()
export class TimeSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column()
  slotType: string; // service or cleanup

  @Column({ type: 'integer', default: null })
  serviceId: number;

  @ManyToOne(() => Service, (service) => service.timeSlots)
  service: Service;

  @OneToMany(() => Booking, (booking) => booking.timeSlot)
  bookings: Booking[];
}
