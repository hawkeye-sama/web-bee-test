import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Service } from './service.entity';

@Entity()
export class Configuration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  maxClients: number;

  @Column({ type: 'integer' })
  serviceId: number;

  @ManyToOne(() => Service, (service) => service.configurations)
  service?: Service;

  @Column()
  maxDaysInFuture: number;
}
