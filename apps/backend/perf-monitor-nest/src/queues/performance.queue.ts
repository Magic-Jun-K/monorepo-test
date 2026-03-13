/**
 * @description 异步队列处理（BullMQ + Redis）
 */
import { Logger } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ClickHouseService } from '../database/clickhouse/clickhouse.service';
import { Performance, PerformanceDocument } from '../modules/performance/performance.schema';
import { PerformanceDataDto } from '../modules/performance/dto/performance-data.dto';

@Processor('performance')
export class PerformanceQueueProcessor {
  private readonly logger = new Logger(PerformanceQueueProcessor.name);

  constructor(
    private readonly clickhouseService: ClickHouseService,
    @InjectModel(Performance.name)
    private performanceModel: Model<PerformanceDocument>,
  ) {}

  /**
   * 处理性能指标数据
   * @param job 包含性能指标数据的作业
   */
  @Process({ name: 'process-metrics', concurrency: 10 })
  async handleMetrics(job: Job<PerformanceDataDto[]>) {
    await this.clickhouseService.insertPerformance(
      job.data.map((data) => ({
        projectId: data.projectId,
        url: data.url,
        env: data.env,
        browser: data.browser,
        fcp: data.fcp,
        lcp: data.lcp,
        cls: data.cls,
        inp: data.inp,
        ttfb: data.ttfb,
      })),
    );
  }

  /**
   * 处理性能数据报告
   * @param job 包含性能数据的作业
   */
  @Process('report')
  async handleReport(job: Job<PerformanceDocument>) {
    const data = job.data;
    // 存储到数据库
    await this.performanceModel.create(data);
  }

  /**
   * 批量处理性能数据
   * @param job 包含性能数据的作业
   */
  @Process({ name: 'batch-process', concurrency: 5 })
  async handleBatchProcess(job: Job<PerformanceDataDto[]>) {
    const data = job.data;
    this.logger.log(`Processing batch of ${data.length} performance records`);

    // 批量写入 ClickHouse
    await this.clickhouseService.insertPerformance(
      data.map((dto) => ({
        projectId: dto.projectId,
        url: dto.url,
        pageId: dto.pageId,
        env: dto.env,
        browser: dto.browser,
        fcp: dto.fcp,
        lcp: dto.lcp,
        cls: dto.cls,
        inp: dto.inp,
        ttfb: dto.ttfb,
        resources: dto.resources,
        navigation: dto.navigation,
      })),
    );

    // 批量写入 MongoDB
    try {
      const docs = data.map((dto) => ({
        projectId: dto.projectId,
        pageId: dto.pageId,
        url: dto.url,
        env: dto.env,
        browser: dto.browser,
        timestamp: new Date(dto.timestamp),
        fcp: dto.fcp,
        lcp: dto.lcp,
        cls: dto.cls,
        inp: dto.inp,
        status: dto.status || 200,
        ttfb: dto.ttfb,
        navigation: dto.navigation,
        resources: dto.resources,
      }));
      await this.performanceModel.insertMany(docs);
    } catch (error) {
      console.error('Failed to save batch to MongoDB:', error);
    }

    // 模拟异步操作避免 require-await 错误
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
}
