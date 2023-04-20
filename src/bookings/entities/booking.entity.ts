import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Service } from './service.entity';
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
  serviceId: number;

  @ManyToOne(() => Service, (service) => service.bookings)
  service: Service;

  @Column()
  bookingStartTime: Date;

  @Column()
  bookingEndTime: Date;
}
