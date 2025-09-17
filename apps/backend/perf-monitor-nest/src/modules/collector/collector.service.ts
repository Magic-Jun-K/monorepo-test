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

  async addToQueue(type: 'performance' | 'error', data: any) {
    const queue = type === 'performance' ? this.performanceQueue : this.errorQueue;

    await queue.add('process', data, {
      attempts: 3,
      backoff: 5000,
      removeOnComplete: true,
    });
  }
}
