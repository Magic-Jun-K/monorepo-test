/**
 * @description 错误日志队列处理（BullMQ + Redis）
 */
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from '@elastic/elasticsearch';
import { UAParser } from 'ua-parser-js';

import { ErrorLog } from '../modules/error-log/schemas/error-log.schema';

@Processor('error')
export class ErrorQueueProcessor {
  private esClient: Client;

  constructor(
    @InjectModel(ErrorLog.name)
    private errorModel: Model<ErrorLog>,
  ) {
    // 初始化 ES 客户端 (建议放入专门的 Service 或 Module)
    this.esClient = new Client({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
      },
    });
  }

  // 数据清洗：解析 UserAgent 和 IP
  private enrichErrorData(data: Partial<ErrorLog>) {
    // 1. UserAgent 解析
    if (data.userAgent && typeof data.userAgent === 'string') {
      const parser = new UAParser(data.userAgent);
      data.userAgent = parser.getResult();
    }

    // 2. IP 解析 (示例: 真实场景可接入 ip2region 或 GeoIP 库)
    if (data.ip) {
      // data.geo = ip2region.search(data.ip);
    }

    return data;
  }

  @Process({ name: 'process-error', concurrency: 10 })
  async handleError(job: Job<Partial<ErrorLog>>) {
    let errorData = job.data;

    // 清洗数据
    errorData = this.enrichErrorData(errorData);

    // 1. 存储错误日志到 MongoDB (持久化存储)
    const doc = await this.errorModel.create(errorData);

    // 2. 存储到 Elasticsearch (全文检索)
    try {
      await this.esClient.index({
        index: 'error-logs',
        document: {
          ...errorData,
          mongoId: doc._id,
          timestamp: new Date(),
        },
      });
    } catch (e) {
      console.error('Failed to index error log to ES:', e);
    }
  }

  @Process({ name: 'batch-process-errors', concurrency: 5 })
  async handleBatchErrors(job: Job<Partial<ErrorLog>[]>) {
    const errors = job.data.map((e) => this.enrichErrorData(e));

    // 1. 批量存储到 MongoDB
    // const docs = await this.errorModel.insertMany(errors);

    // 2. 批量存储到 Elasticsearch
    try {
      const operations = errors.flatMap((doc) => [
        { index: { _index: 'error-logs' } },
        { ...doc, timestamp: new Date() },
      ]);

      if (operations.length > 0) {
        await this.esClient.bulk({ operations });
      }
    } catch (e) {
      console.error('Failed to bulk index error logs to ES:', e);
    }
  }
}
