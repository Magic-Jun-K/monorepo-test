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
          point
            .tag('resource_type', res.type)
            .floatField(res.name, res.duration);
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
    return await this.performanceModel
      .find(query)
      .limit(50)
      .sort({ timestamp: -1 });
  }
}
