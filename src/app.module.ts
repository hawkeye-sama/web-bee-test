import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookingsModule } from './bookings/bookings.module';
import { typeOrmAsyncConfig } from './config/typeorm.config';

export const appModuleConfig = {
  imports: [TypeOrmModule.forRootAsync(typeOrmAsyncConfig), BookingsModule],
  controllers: [],
  providers: [],
};

@Module(appModuleConfig)
export class AppModule {}
