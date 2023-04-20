import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TimeSlot } from './timeslot.entity';
import { User } from './user.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number;

  @ManyToOne(() => User, (user) => user.bookings)
  user: User;

  @Column({ type: 'integer' })
  timeSlotId: number;

  @ManyToOne(() => TimeSlot, (timeSlot) => timeSlot.bookings)
  timeSlot: TimeSlot;

  @Column()
  bookingDate: Date;
}
