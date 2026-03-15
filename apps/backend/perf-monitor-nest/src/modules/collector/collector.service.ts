/**
 * @description 队列处理服务
 */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';

@Injectable()
export class CollectorService {
  constructor(
    @InjectQueue('performance') private performanceQueue: Queue,
    @InjectQueue('error') private errorQueue: Queue,
  ) {}

  /**
   * 添加数据到队列
   * @param type 数据类型
   * @param data 数据
   */
  async addToQueue(type: 'performance' | 'error', data: unknown) {
    const queue = type === 'performance' ? this.performanceQueue : this.errorQueue;

    // 包装成数组以匹配 'batch-process' 处理器的期望 (Job<PerformanceDataDto[]>)
    const payload = Array.isArray(data) ? data : [data];

    await queue.add('batch-process', payload, {
      attempts: 3,
      backoff: 5000,
      removeOnComplete: true,
    });
  }
}
