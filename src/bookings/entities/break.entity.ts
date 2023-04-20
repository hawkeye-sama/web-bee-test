import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Service } from './service.entity';

@Entity()
export class Break {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ type: 'integer' })
  serviceId: number;

  @ManyToOne(() => Service, (service) => service.breaks)
  service?: Service;
}
