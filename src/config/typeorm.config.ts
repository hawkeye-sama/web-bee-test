import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule.forRoot()],
  inject: [ConfigService],
  useFactory: async (): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'sqlite',
      database: 'database.db',
      entities: [__dirname + '/../entities/*.entity.{js,ts}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      migrationsTableName: 'migrations',
      synchronize: false,
      logging: true,
      autoLoadEntities: true,
    };
  },
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'database.db',
  entities: [__dirname + '/../entities/*.entity.{js,ts}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
  autoLoadEntities: true,
};

export const seederOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'database.db',
  entities: [__dirname + '/../entities/*.entity.{js,ts}'],
  migrations: [__dirname + '/../database/seeder/*{.ts,.js}'],
  migrationsTableName: 'seeds',
  synchronize: false,
  logging: true,
  autoLoadEntities: true,
};
