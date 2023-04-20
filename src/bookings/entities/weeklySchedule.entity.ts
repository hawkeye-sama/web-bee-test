import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Service } from './service.entity';

@Entity('weekly_schedule')
export class WeeklySchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  serviceId: number;

  @ManyToOne(() => Service, (service) => service.weeklySchedules)
  service?: Service;

  @Column()
  dayOfTheWeek: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;
}
