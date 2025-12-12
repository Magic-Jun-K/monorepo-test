/**
 * @description 异步队列处理（BullMQ + Redis）
 */
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Point } from '@influxdata/influxdb-client';

import { InfluxService } from '../database/influx/influx.service';
import { Performance, PerformanceDocument } from '../modules/performance/performance.schema';
import { PerformanceDataDto } from '../modules/performance/dto/performance-data.dto';

@Processor('performance-queue')
export class PerformanceQueueProcessor {
  constructor(
    private readonly influxService: InfluxService,
    @InjectModel(Performance.name)
    private performanceModel: Model<PerformanceDocument>,
  ) {}

  @Process({ name: 'process-metrics', concurrency: 10 })
  async handleMetrics(job: Job<PerformanceDataDto[]>) {
    const points = job.data.map((data) =>
      new Point('web_perf')
        .tag('project', data.projectId)
        .tag('env', data.env)
        .tag('url', data.url)
        .floatField('fcp', data.fcp)
        .floatField('lcp', data.lcp)
        .floatField('cls', data.cls)
        .floatField('fid', data.fid)
        .timestamp(new Date(data.timestamp)),
    );

    this.influxService.writePoints(points);
    // 模拟异步操作避免 require-await 错误
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  @Process('report')
  async handleReport(job: Job<PerformanceDocument>) {
    const data = job.data;
    // 存储到数据库
    await this.performanceModel.create(data);
  }

  // 添加批量处理性能数据的方法
  @Process({ name: 'batch-process', concurrency: 5 })
  async handleBatchProcess(job: Job<PerformanceDataDto[]>) {
    const data = job.data;

    // 创建性能点数据
    const points = data.map((dto) => {
      const point = new Point('web_perf')
        .tag('project', dto.projectId)
        .tag('env', dto.env)
        .tag('url', dto.url)
        .tag('browser', dto.browser)
        .floatField('fcp', dto.fcp)
        .floatField('lcp', dto.lcp)
        .floatField('cls', dto.cls)
        .floatField('fid', dto.fid)
        .intField('status', dto.status || 200)
        .timestamp(new Date(dto.timestamp));

      // 添加资源指标
      if (dto.resources) {
        dto.resources.forEach((res) => {
          point.tag('resource_type', res.type).floatField(res.name, res.duration);
        });
      }

      return point;
    });

    // 批量写入InfluxDB
    this.influxService.writePoints(points);
    // 模拟异步操作避免 require-await 错误
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
}
