import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Break } from './break.entity';
import { Configuration } from './configuration.entity';
import { PlannedOffDate } from './plannedOff.entity';
import { TimeSlot } from './timeslot.entity';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => TimeSlot, (timeSlot) => timeSlot.service)
  timeSlots: TimeSlot[];

  @OneToMany(() => Break, (br) => br.service)
  breaks: Break[];

  @OneToMany(() => PlannedOffDate, (plannedOffDate) => plannedOffDate.service)
  plannedOffDates: PlannedOffDate[];

  @OneToMany(() => Configuration, (configuration) => configuration.service)
  configurations: Configuration[];
}
