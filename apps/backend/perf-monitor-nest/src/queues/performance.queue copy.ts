/**
 * @description 消息队列处理 (queues) - 性能数据处理 Worker
 */
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bullmq';

import { InfluxService } from 'src/database/influx/influx.service';
import { AlertService } from 'src/modules/alert/alert.service';
import { PerformanceDTO } from 'src/modules/collector/dto/performance.dto';

@Processor('performance')
export class PerformanceProcessor {
  constructor(
    private readonly influxService: InfluxService,
    private readonly alertService: AlertService,
  ) {}

  @Process('process')
  async handlePerformance(job: Job<PerformanceDTO>) {
    const data = job.data;

    // 1. 写入时序数据库
    await this.influxService.writePerformance(data);

    // 2. 检查是否触发报警
    if (data.lcp > 2500) {
      await this.alertService.checkLCPAlert(data);
    }
  }
}
