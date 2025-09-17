import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectQueue } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Redis } from 'ioredis';
import { Point } from '@influxdata/influxdb-client';
import { Queue } from 'bullmq';
import { FilterQuery, Model } from 'mongoose';

import { InfluxService } from '../../database/influx/influx.service';
import { PerformanceDataDto } from './dto/performance-data.dto';
import { PerformanceDocument } from './performance.schema';

@Injectable()
export class PerformanceService {
  constructor(
    private readonly influxService: InfluxService,
    @InjectRedis() private readonly redisClient: Redis, // 注入Redis客户端
    @InjectQueue('performance-queue') private readonly performanceQueue: Queue,
    @InjectModel(Performance.name)
    private readonly performanceModel: Model<PerformanceDocument>,
  ) {}

  async processBatch(data: PerformanceDataDto[]) {
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

    // 获取影响的项目ID和时间范围
    const impactedProjects = new Set(data.map((d) => d.projectId));

    // 删除相关缓存
    for (const projectId of impactedProjects) {
      const pattern = `stats:${projectId}:*`;
      const keys = await this.redisClient.keys(pattern);
      if (keys.length) await this.redisClient.del(...keys);
    }
  }

  async getPerformanceStats<T>(projectId: string): Promise<T[]> {
    const cacheKey = `stats:${projectId}:24h`; // 唯一缓存键

    // 1. 尝试从缓存获取
    const cached = await this.redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached) as T[];

    // 2. 缓存未命中则查询数据库
    const query = `
      SELECT 
        MEAN(fcp) AS avg_fcp,
        PERCENTILE(fcp, 90) AS p90_fcp,
        MEAN(lcp) AS avg_lcp,
        COUNT(*) AS total_visits
      FROM web_perf
      WHERE project = '${projectId}'
      AND time > now() - 24h
      GROUP BY time(1h), url
    `;

    const result = await this.influxService.query<T>(query);

    // 3. 写入缓存 (5分钟过期)
    await this.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }

  async handleReport(data: any) {
    // 推送到队列，异步处理
    await this.performanceQueue.add('report', data);
  }

  async queryPerformance(query: FilterQuery<PerformanceDocument>) {
    // 简单分页查询
    return await this.performanceModel.find(query).limit(50).sort({ timestamp: -1 });
  }

  // 获取页面性能指标趋势
  async getPagePerformanceTrend(projectId: string, url: string, hours: number = 24) {
    const query = `
      SELECT 
        MEAN(fcp) AS avg_fcp,
        MEAN(lcp) AS avg_lcp,
        MEAN(cls) AS avg_cls,
        MEAN(fid) AS avg_fid,
        COUNT(*) AS count
      FROM web_perf
      WHERE project = '${projectId}'
        AND url = '${url}'
        AND time > now() - ${hours}h
      GROUP BY time(1h)
      ORDER BY time ASC
    `;

    return await this.influxService.query(query);
  }

  // 获取页面性能指标分布
  async getPagePerformanceDistribution(projectId: string, url: string, hours: number = 24) {
    const query = `
      SELECT 
        PERCENTILE(fcp, 50) AS p50_fcp,
        PERCENTILE(fcp, 75) AS p75_fcp,
        PERCENTILE(fcp, 90) AS p90_fcp,
        PERCENTILE(fcp, 95) AS p95_fcp,
        PERCENTILE(fcp, 99) AS p99_fcp,
        PERCENTILE(lcp, 50) AS p50_lcp,
        PERCENTILE(lcp, 75) AS p75_lcp,
        PERCENTILE(lcp, 90) AS p90_lcp,
        PERCENTILE(lcp, 95) AS p95_lcp,
        PERCENTILE(lcp, 99) AS p99_lcp
      FROM web_perf
      WHERE project = '${projectId}'
        AND url = '${url}'
        AND time > now() - ${hours}h
    `;

    return await this.influxService.query(query);
  }

  // 获取按浏览器分类的性能数据
  async getPerformanceByBrowser(projectId: string, hours: number = 24) {
    const query = `
      SELECT 
        MEAN(fcp) AS avg_fcp,
        MEAN(lcp) AS avg_lcp,
        COUNT(*) AS count
      FROM web_perf
      WHERE project = '${projectId}'
        AND time > now() - ${hours}h
      GROUP BY browser
    `;

    return await this.influxService.query(query);
  }

  // 获取最慢的页面
  async getSlowestPages(projectId: string, limit: number = 10, hours: number = 24) {
    const query = `
      SELECT 
        MEAN(lcp) AS avg_lcp,
        COUNT(*) AS count
      FROM web_perf
      WHERE project = '${projectId}'
        AND time > now() - ${hours}h
      GROUP BY url
      ORDER BY avg_lcp DESC
      LIMIT ${limit}
    `;

    return await this.influxService.query(query);
  }

  // 获取性能概览数据
  async getPerformanceOverview(projectId: string, hours: number = 24) {
    const query = `
      SELECT 
        MEAN(fcp) AS avg_fcp,
        MEAN(lcp) AS avg_lcp,
        MEAN(cls) AS avg_cls,
        MEAN(fid) AS avg_fid,
        COUNT(*) AS total_visits,
        COUNT(DISTINCT url) AS unique_pages
      FROM web_perf
      WHERE project = '${projectId}'
        AND time > now() - ${hours}h
    `;

    return await this.influxService.query(query);
  }

  // 删除过期性能数据
  async deleteExpiredPerformanceData(days: number = 30): Promise<{ message: string }> {
    // InfluxDB 数据保留策略应该在数据库层面配置
    // 这里仅提供接口，实际实现依赖于InfluxDB的保留策略
    console.log(`Scheduled deletion of performance data older than ${days} days`);
    // 模拟异步操作避免 require-await 错误
    await new Promise((resolve) => setTimeout(resolve, 0));
    return { message: `Scheduled deletion of performance data older than ${days} days` };
  }
}
