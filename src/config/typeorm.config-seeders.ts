import { DataSource, DataSourceOptions } from 'typeorm';

import { seederOrmConfig } from './typeorm.config';

export const AppDataSource = new DataSource(
  seederOrmConfig as DataSourceOptions,
);
