// src/modules/error-log/error-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';

import { ErrorLog } from './schemas/error-log.schema';

type BulkWriteResult = mongo.BulkWriteResult;

@Injectable()
export class ErrorLogService {
  constructor(
    @InjectModel(ErrorLog.name) private errorModel: Model<ErrorLog>,
  ) {}

  async bulkInsert(errors: ErrorLog[]): Promise<BulkWriteResult> {
    // 批量写入优化
    const ops = errors.map((error) => ({
      insertOne: { document: error },
    }));

    return this.errorModel.bulkWrite(ops, { ordered: false });
  }

  // 错误聚合分析
  async getTopErrors(projectId: string, hours: number = 24) {
    return this.errorModel.aggregate([
      {
        $match: {
          projectId,
          timestamp: { $gte: new Date(Date.now() - hours * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            message: '$message',
            stack: { $substrCP: ['$stack', 0, 200] },
          },
          count: { $sum: 1 },
          lastOccurred: { $max: '$timestamp' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
  }
}
