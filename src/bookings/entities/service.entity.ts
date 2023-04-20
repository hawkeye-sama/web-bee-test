import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Booking } from './booking.entity';
import { Break } from './break.entity';
import { Configuration } from './configuration.entity';
import { PlannedOffDate } from './plannedOff.entity';
import { WeeklySchedule } from './weeklySchedule.entity';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  duration: number;

  @Column()
  cleanupDuration: number;

  @OneToMany(() => Booking, (booking) => booking.service)
  bookings?: Booking[];

  @OneToMany(() => Break, (br) => br.service)
  breaks?: Break[];

  @OneToMany(() => PlannedOffDate, (plannedOffDate) => plannedOffDate.service)
  plannedOffDates?: PlannedOffDate[];

  @OneToMany(() => Configuration, (configuration) => configuration.service)
  configurations?: Configuration[];

  @OneToMany(() => WeeklySchedule, (weeklySchedule) => weeklySchedule.service)
  weeklySchedules?: WeeklySchedule[];
}
