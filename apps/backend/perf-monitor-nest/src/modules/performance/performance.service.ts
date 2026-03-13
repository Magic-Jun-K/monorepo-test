import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectQueue } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Redis } from 'ioredis';
import { Queue } from 'bullmq';
import type { Model } from 'mongoose';

import { ClickHouseService } from '../../database/clickhouse/clickhouse.service';
import { PerformanceDataDto } from './dto/performance-data.dto';
import { Performance, PerformanceDocument } from './performance.schema';

@Injectable()
export class PerformanceService {
  constructor(
    private readonly clickhouseService: ClickHouseService,
    @InjectRedis() private readonly redisClient: Redis, // 注入Redis客户端
    @InjectQueue('performance') private readonly performanceQueue: Queue,
    @InjectModel(Performance.name)
    private readonly performanceModel: Model<PerformanceDocument>,
  ) {}

  /**
   * 处理批量性能数据
   * @param data 性能数据数组
   */
  async processBatch(data: PerformanceDataDto[]) {
    // 将数据处理任务添加到队列
    await this.performanceQueue.add('batch-process', data);

    // 获取影响的项目ID和时间范围
    const impactedProjects = new Set(data.map((d) => d.projectId));

    // 删除相关缓存
    for (const projectId of impactedProjects) {
      const pattern = `stats:${projectId}:*`;
      const keys = await this.redisClient.keys(pattern);
      if (keys.length) await this.redisClient.del(...keys);
    }
  }

  /**
   * 获取项目24小时内的性能统计数据
   * @param projectId 项目ID
   * @returns 性能统计数据数组
   */
  async getPerformanceStats<T>(projectId: string): Promise<T[]> {
    const cacheKey = `stats:${projectId}:24h`; // 唯一缓存键

    // 1. 尝试从缓存获取
    const cached = await this.redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached) as T[];

    const result = await this.clickhouseService.getPerformanceStats<T>(projectId, 24);

    await this.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }

  /**
   * 处理性能报告数据
   * @param data 性能报告数据
   */
  async handleReport(data: unknown) {
    // 推送到队列，异步处理
    await this.performanceQueue.add('report', data);
  }

  /**
   * 查询性能数据
   * @param query 查询参数
   * @returns 性能数据查询结果
   */
  async queryPerformance(query: Record<string, unknown>) {
    const { page = 1, pageSize = 20, startDate, endDate, ...filters } = query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    const mongoQuery: Record<string, unknown> = { ...filters };

    // 处理时间范围查询
    if (startDate && endDate) {
      mongoQuery.timestamp = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // 处理部分匹配查询（例如URL）
    if (filters.url) {
      mongoQuery.url = { $regex: filters.url, $options: 'i' };
    }

    // 处理项目ID查询
    if (filters.projectId) {
      mongoQuery.projectId = filters.projectId;
    }

    // 处理状态码查询 (支持 2xx, 4xx, 5xx 或具体数字)
    if (filters.status) {
      const statusStr = String(filters.status);
      if (statusStr.toLowerCase().endsWith('xx')) {
        const base = Number.parseInt(statusStr.charAt(0), 10);
        if (!Number.isNaN(base)) {
          mongoQuery.status = { $gte: base * 100, $lt: (base + 1) * 100 };
        }
      } else {
        const statusNum = Number(statusStr);
        if (!Number.isNaN(statusNum)) {
          mongoQuery.status = statusNum;
        }
      }
    }

    // 移除空值字段
    Object.keys(mongoQuery).forEach((key) => {
      if (mongoQuery[key] === undefined || mongoQuery[key] === '' || mongoQuery[key] === null) {
        delete mongoQuery[key];
      }
    });

    const [list, total] = await Promise.all([
      this.performanceModel.find(mongoQuery).sort({ timestamp: -1 }).skip(skip).limit(limit).exec(),
      this.performanceModel.countDocuments(mongoQuery),
    ]);

    return { list, total };
  }

  /**
   * 获取项目24小时内页面性能指标趋势
   * @param projectId 项目ID
   * @param url 页面URL（可选）
   * @param hours 查询时间范围（小时）
   * @returns 页面性能指标趋势数据
   */
  async getPagePerformanceTrend(projectId: string, url?: string, hours: number = 24) {
    return await this.clickhouseService.getPagePerformanceTrend(projectId, url, hours);
  }

  /**
   * 获取项目24小时内页面性能指标分布（p75）
   * @param projectId 项目ID
   * @param url 页面URL
   * @param hours 查询时间范围（小时）
   * @returns 页面性能指标分布数据
   */
  async getPagePerformanceDistribution(projectId: string, url: string, hours: number = 24) {
    return await this.clickhouseService.getPagePerformanceDistribution(projectId, url, hours);
  }

  /**
   * 获取项目24小时内按浏览器分类的性能数据
   * @param projectId 项目ID
   * @param hours 查询时间范围（小时）
   * @returns 按浏览器分类的性能数据
   */
  async getPerformanceByBrowser(projectId: string, hours: number = 24) {
    return await this.clickhouseService.getPerformanceByBrowser(projectId, hours);
  }

  /**
   * 获取项目24小时内最慢的页面（按LCP排序）
   * @param projectId 项目ID
   * @param limit 返回结果数量（默认10）
   * @param hours 查询时间范围（小时）
   * @returns 最慢的页面数据
   */
  async getSlowestPages(projectId: string, limit: number = 10, hours: number = 24) {
    return await this.clickhouseService.getSlowestPages(projectId, limit, hours);
  }

  /**
   * 获取项目24小时内性能概览数据（PV、FCP、LCP、CLS、INP）
   * @param projectId 项目ID
   * @param hours 查询时间范围（小时）
   * @returns 性能概览数据
   */
  async getPerformanceOverview(projectId: string, hours: number = 24) {
    return await this.clickhouseService.getPerformanceOverview(projectId, hours);
  }

  /**
   * 删除项目24小时前的性能数据
   * @param days 保留天数（默认30天）
   * @returns 删除结果消息
   */
  async deleteExpiredPerformanceData(days: number = 90): Promise<{ message: string }> {
    return { message: `ClickHouse TTL auto-deletes data older than ${days} days` };
  }
}
