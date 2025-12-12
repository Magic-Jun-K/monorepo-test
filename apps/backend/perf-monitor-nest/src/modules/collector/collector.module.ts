import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { CollectorController } from './collector.controller';
import { CollectorService } from './collector.service';
import { MonitoringService } from '../../common/monitoring/monitoring.service';
import { PerformanceInterceptor } from '../../common/interceptors/performance.interceptor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'performance' }),
    BullModule.registerQueue({ name: 'error' }),
  ],
  controllers: [CollectorController],
  providers: [CollectorService, MonitoringService, PerformanceInterceptor],
  exports: [CollectorService],
})
export class CollectorModule {}
