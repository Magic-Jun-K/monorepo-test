import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ErrorLog } from './schemas/error-log.schema';

@Injectable()
export class ErrorLogService {
  constructor(@InjectModel(ErrorLog.name) private errorModel: Model<ErrorLog>) {}

  async bulkInsert(errors: Partial<ErrorLog>[]): Promise<unknown> {
    // 使用 insertMany 替代 bulkWrite 以避免类型问题
    return this.errorModel.insertMany(errors, { ordered: false });
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

  // 按错误类型分类统计
  async getErrorDistribution(projectId: string, hours: number = 24) {
    return this.errorModel.aggregate([
      {
        $match: {
          projectId,
          timestamp: { $gte: new Date(Date.now() - hours * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  // 错误趋势分析
  async getErrorTrend(projectId: string, hours: number = 24) {
    const interval = Math.max(1, Math.floor(hours / 24)); // 每小时一个点，最多24个点
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
            interval: {
              $subtract: [
                { $toLong: '$timestamp' },
                {
                  $mod: [
                    { $toLong: '$timestamp' },
                    interval * 60 * 60 * 1000, // 按间隔分组
                  ],
                },
              ],
            },
          },
          count: { $sum: 1 },
          timestamp: { $first: '$timestamp' },
        },
      },
      {
        $project: {
          _id: 0,
          timestamp: '$_id.interval',
          count: 1,
        },
      },
      { $sort: { timestamp: 1 } },
    ]);
  }

  // 获取最新错误详情
  async getRecentErrors(projectId: string, limit: number = 50) {
    return this.errorModel.find({ projectId }).sort({ timestamp: -1 }).limit(limit).exec();
  }

  // 根据错误ID获取详细信息
  async getErrorById(id: string) {
    return this.errorModel.findById(id).exec();
  }

  // 删除过期错误日志
  async deleteExpiredErrors(days: number = 30): Promise<{ deletedCount?: number }> {
    const expiryDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.errorModel
      .deleteMany({
        timestamp: { $lt: expiryDate },
      })
      .exec();
  }
}
