import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, ClickHouseClient } from '@clickhouse/client';

import { ClickHouseConfig, PerformanceRow } from './clickhouse.interface';
import { PerformanceDTO } from '../../modules/collector/dto/performance.dto';

export interface PerformanceTrendResult {
  time: string;
  pv: number;
  avg_fcp: number;
  avg_lcp: number;
  avg_cls: number;
  avg_inp: number;
}

export interface BrowserPerformanceResult {
  browser: string;
  count: number;
  avg_fcp: number;
  avg_lcp: number;
}

export interface SlowestPageResult {
  url: string;
  avg_lcp: number;
  avg_fcp: number;
  avg_cls: number;
  avg_inp: number;
}

export interface PerformanceOverviewResult {
  pv: number;
  avg_fcp: number;
  avg_lcp: number;
  avg_cls: number;
  avg_inp: number;
}

export interface PerformanceDistributionResult {
  p75_fcp: number;
  p75_lcp: number;
  p95_fcp: number;
  p95_lcp: number;
}

@Injectable()
export class ClickHouseService implements OnModuleInit, OnModuleDestroy {
  private client: ClickHouseClient;
  private readonly logger = new Logger(ClickHouseService.name);
  private readonly database: string;

  constructor(private readonly config: ClickHouseConfig) {
    this.database = config.database;
  }

  /**
   * 模块初始化时创建 ClickHouse 连接
   */
  async onModuleInit() {
    this.client = createClient({
      url: `${this.config.host}:${this.config.port || 8123}`,
      username: this.config.username,
      password: this.config.password,
      database: this.config.database,
    });

    await this.initDatabase();
    this.logger.log('ClickHouse connected successfully');
  }

  /**
   * 模块销毁时关闭 ClickHouse 连接
   */
  async onModuleDestroy() {
    await this.client.close();
  }

  /**
   * 初始化数据库表（如果不存在）
   */
  private async initDatabase() {
    // 先创建数据库（如果不存在）
    await this.client.command({
      query: `CREATE DATABASE IF NOT EXISTS ${this.database}`,
    });

    await this.client.command({
      query: `
        CREATE TABLE IF NOT EXISTS ${this.database}.web_perf (
          timestamp DateTime64(3),
          project_id String,
          url String,
          page_id String DEFAULT '',
          env LowCardinality(String) DEFAULT '',
          browser LowCardinality(String) DEFAULT '',
          fcp Float32 DEFAULT 0,
          lcp Float32 DEFAULT 0,
          inp Float32 DEFAULT 0,
          cls Float32 DEFAULT 0,
          ttfb Float32 DEFAULT 0,
          status Int16 DEFAULT 0,
          resources String DEFAULT '',
          navigation String DEFAULT ''
        )
        ENGINE = MergeTree()
        PARTITION BY toYYYYMM(timestamp)
        ORDER BY (project_id, timestamp, url)
        TTL timestamp + INTERVAL 90 DAY
      `,
    });
  }

  /**
   * 写入单条性能数据
   * @param data 性能数据
   */
  async writePerformance(data: PerformanceDTO) {
    await this.insertPerformance([data]);
  }

  /**
   * 批量写入性能数据
   * @param data 性能数据数组
   */
  async insertPerformance(data: PerformanceDTO[]) {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').replace('Z', '');

    const rows: PerformanceRow[] = data.map((item) => ({
      timestamp,
      project_id: item.projectId,
      url: item.url,
      page_id: item.pageId || '',
      env: item.env || '',
      browser: item.browser || '',
      fcp: item.fcp || 0,
      lcp: item.lcp || 0,
      inp: item.inp || 0,
      cls: item.cls || 0,
      ttfb: item.ttfb || 0,
      status: 0,
      resources: item.resources ? JSON.stringify(item.resources) : '',
      navigation: item.navigation ? JSON.stringify(item.navigation) : '',
    }));

    try {
      await this.client.insert({
        table: `${this.database}.web_perf`,
        values: rows,
        format: 'JSONEachRow',
      });
      this.logger.log(`Inserted ${rows.length} rows into ClickHouse`);
    } catch (error) {
      this.logger.error('Failed to insert into ClickHouse:', error);
      throw error;
    }
  }

  /**
   * 获取当前数据库名称
   */
  getDatabase(): string {
    return this.database;
  }

  /**
   * 执行 ClickHouse 查询
   * @param query ClickHouse 查询语句
   * @param params 查询参数（可选）
   * @returns 查询结果
   */
  async query<T>(query: string, params?: Record<string, unknown>): Promise<T[]> {
    const result = await this.client.query({
      query,
      query_params: params,
      format: 'JSON',
    });

    const response = await result.json();
    return (response as { data: T[] }).data;
  }

  /**
   * 获取项目性能统计（按小时）
   * @param projectId 项目 ID
   * @param hours 时间范围（小时）
   * @returns 项目性能统计结果
   */
  async getPerformanceStats<T>(projectId: string, hours: number = 24): Promise<T[]> {
    const query = `
      SELECT
        toStartOfHour(timestamp) as time,
        url,
        avg(fcp) as avg_fcp,
        avg(lcp) as avg_lcp,
        avg(cls) as avg_cls,
        avg(inp) as avg_inp,
        count() as pv
      FROM web_perf
      WHERE project_id = {projectId:String}
        AND timestamp >= now() - INTERVAL ${hours} HOUR
      GROUP BY time, url
      ORDER BY time, url
    `;

    return this.query<T>(query, { projectId });
  }

  /**
   * 获取页面性能趋势（按 30 分钟间隔）
   * @param projectId 项目 ID
   * @param url 页面 URL（可选）
   * @param hours 时间范围（小时）
   * @returns 页面性能趋势结果
   */
  async getPagePerformanceTrend(
    projectId: string,
    url?: string,
    hours: number = 24,
  ): Promise<PerformanceTrendResult[]> {
    const urlCondition = url ? 'AND url = {url:String}' : '';
    const query = `
      SELECT
        toStartOfInterval(timestamp, INTERVAL 30 MINUTE) as time,
        count() as pv,
        avg(fcp) as avg_fcp,
        avg(lcp) as avg_lcp,
        avg(cls) as avg_cls,
        avg(inp) as avg_inp
      FROM web_perf
      WHERE project_id = {projectId:String}
        AND timestamp >= now() - INTERVAL ${hours} HOUR
        ${urlCondition}
      GROUP BY time
      ORDER BY time
    `;

    return this.query(query, { projectId, url });
  }

  /**
   * 获取浏览器性能分布
   * @param projectId 项目 ID
   * @param hours 时间范围（小时）
   * @returns 浏览器性能分布结果
   */
  async getPerformanceByBrowser(
    projectId: string,
    hours: number = 24,
  ): Promise<BrowserPerformanceResult[]> {
    const query = `
      SELECT
        browser,
        count() as count,
        avg(fcp) as avg_fcp,
        avg(lcp) as avg_lcp
      FROM web_perf
      WHERE project_id = {projectId:String}
        AND timestamp >= now() - INTERVAL ${hours} HOUR
      GROUP BY browser
      ORDER BY count DESC
    `;

    return this.query(query, { projectId });
  }

  /**
   * 获取最慢的页面（按 LCP 排序）
   * @param projectId 项目 ID
   * @param limit 返回结果数量
   * @param hours 时间范围（小时）
   * @returns 最慢的页面结果
   */
  async getSlowestPages(
    projectId: string,
    limit: number = 10,
    hours: number = 24,
  ): Promise<SlowestPageResult[]> {
    const query = `
      SELECT
        url,
        avg(lcp) as avg_lcp,
        avg(fcp) as avg_fcp,
        avg(cls) as avg_cls,
        avg(inp) as avg_inp
      FROM web_perf
      WHERE project_id = {projectId:String}
        AND timestamp >= now() - INTERVAL ${hours} HOUR
      GROUP BY url
      ORDER BY avg_lcp DESC
      LIMIT ${limit}
    `;

    return this.query(query, { projectId });
  }

  /**
   * 获取项目性能总览
   * @param projectId 项目 ID
   * @param hours 时间范围（小时）
   * @returns 项目性能总览结果
   */
  async getPerformanceOverview(
    projectId: string,
    hours: number = 24,
  ): Promise<PerformanceOverviewResult[]> {
    const query = `
      SELECT
        count() as pv,
        avg(fcp) as avg_fcp,
        avg(lcp) as avg_lcp,
        avg(cls) as avg_cls,
        avg(inp) as avg_inp
      FROM web_perf
      WHERE project_id = {projectId:String}
        AND timestamp >= now() - INTERVAL ${hours} HOUR
    `;

    return this.query(query, { projectId });
  }

  /**
   * 获取页面性能分布（分位数）
   * @param projectId 项目 ID
   * @param url 页面 URL
   * @param hours 时间范围（小时）
   * @returns 页面性能分布结果
   */
  async getPagePerformanceDistribution(
    projectId: string,
    url: string,
    hours: number = 24,
  ): Promise<PerformanceDistributionResult[]> {
    const query = `
      SELECT
        quantile(0.75)(fcp) as p75_fcp,
        quantile(0.75)(lcp) as p75_lcp,
        quantile(0.95)(fcp) as p95_fcp,
        quantile(0.95)(lcp) as p95_lcp
      FROM web_perf
      WHERE project_id = {projectId:String}
        AND url = {url:String}
        AND timestamp >= now() - INTERVAL ${hours} HOUR
    `;

    return this.query(query, { projectId, url });
  }
}
