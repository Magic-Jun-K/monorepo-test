/**
 * @description 错误日志队列处理（BullMQ + Redis）
 */
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ErrorLog } from '../modules/error-log/schemas/error-log.schema';

@Processor('error')
export class ErrorQueueProcessor {
  constructor(
    @InjectModel(ErrorLog.name)
    private errorModel: Model<ErrorLog>,
  ) {}

  @Process({ name: 'process-error', concurrency: 10 })
  async handleError(job: Job<Partial<ErrorLog>>) {
    const errorData = job.data;

    // 存储错误日志到数据库
    await this.errorModel.create(errorData);
  }

  @Process({ name: 'batch-process-errors', concurrency: 5 })
  async handleBatchErrors(job: Job<Partial<ErrorLog>[]>) {
    const errors = job.data;

    // 批量存储错误日志到数据库
    await this.errorModel.insertMany(errors);
  }
}
