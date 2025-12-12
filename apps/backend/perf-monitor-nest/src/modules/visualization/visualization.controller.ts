/**
 * @description 可视化API (visualization) - Grafana 数据源API
 */
import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { PerformanceService } from '../performance/performance.service';

@ApiTags('Analytics')
@Controller('analytics')
export class VisualizationController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('performance')
  @ApiQuery({ name: 'metric', enum: ['lcp', 'fcp', 'cls'] })
  async getPerformanceData(
    @Query('project') project: string,
    @Query('metric') metric: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    // 调用 performanceService 中的方法获取性能数据
    const data = await this.performanceService.getPerformanceOverview(project, 24);
    return {
      project,
      metric,
      start,
      end,
      data
    };
  }
}
