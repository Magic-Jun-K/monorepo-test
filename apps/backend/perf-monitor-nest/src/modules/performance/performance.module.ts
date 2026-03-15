import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';

import { DatabaseModule } from '../../database/database.module';

import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { Performance, PerformanceSchema } from './performance.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Performance.name, schema: PerformanceSchema }]),
    BullModule.registerQueue({ name: 'performance' }),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
