import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Service } from './service.entity';

@Entity()
export class PlannedOffDate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ type: 'integer' })
  serviceId: number;

  @ManyToOne(() => Service, (service) => service.plannedOffDates)
  service: Service;
}
