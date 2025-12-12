import { Module } from '@nestjs/common';
import { PerformanceModule } from '../performance/performance.module';
import { VisualizationController } from './visualization.controller';

@Module({
  imports: [PerformanceModule],
  controllers: [VisualizationController],
})
export class VisualizationModule {}
