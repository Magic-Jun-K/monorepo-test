/**
 * @description 可视化API (visualization) - Grafana 数据源API
 */
import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { PerformanceService } from '../performance/performance.service';
import {
  PerformanceOverviewResult,
  PerformanceTrendResult,
} from '../../database/clickhouse/clickhouse.service';

@ApiTags('Analytics')
@Controller('analytics')
export class VisualizationController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('performance')
  @ApiQuery({ name: 'metric', enum: ['lcp', 'fcp', 'cls'], required: false })
  async getPerformanceData(
    @Query('project') project: string,
    @Query('metric') metric: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    // 默认查询最近24小时
    const hours = start ? (Date.now() - new Date(start).getTime()) / (1000 * 60 * 60) : 24;

    // 调用 performanceService 中的方法获取性能概览
    const data: PerformanceOverviewResult[] = await this.performanceService.getPerformanceOverview(
      project,
      hours,
    );
    const result = data[0] || {};
    return {
      project,
      metric,
      start,
      end,
      pv: result.pv || 0,
      fcp: result.avg_fcp || 0,
      lcp: result.avg_lcp || 0,
      cls: result.avg_cls || 0,
      inp: result.avg_inp || 0,
    };
  }

  @Get('trend')
  @ApiQuery({ name: 'url', required: false })
  async getPerformanceTrend(
    @Query('project') project: string,
    @Query('url') url: string,
    @Query('hours') hours: number = 24,
  ) {
    const data: PerformanceTrendResult[] = await this.performanceService.getPagePerformanceTrend(
      project,
      url,
      hours,
    );
    return data.map((item) => ({
      time: item.time,
      pv: item.pv || 0,
      fcp: item.avg_fcp || 0,
      lcp: item.avg_lcp || 0,
      cls: item.avg_cls || 0,
      inp: item.avg_inp || 0,
    }));
  }

  @Get('browser')
  async getBrowserStats(@Query('project') project: string, @Query('hours') hours: number = 24) {
    return await this.performanceService.getPerformanceByBrowser(project, hours);
  }

  @Get('slowest')
  async getSlowestPages(
    @Query('project') project: string,
    @Query('limit') limit: number = 10,
    @Query('hours') hours: number = 24,
  ) {
    return await this.performanceService.getSlowestPages(project, limit, hours);
  }
}
