/**
 * @description 数据存储模块 (storage) - InfluxDB 集成服务
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';

import { InfluxConfig } from './influx.interface';
import { PerformanceDTO } from '../../modules/collector/dto/performance.dto';

@Injectable()
export class InfluxService implements OnModuleInit, OnModuleDestroy {
  private influxClient: InfluxDB;
  private writeApi: WriteApi;

  constructor(private readonly config: InfluxConfig) {}

  // constructor(private configService: ConfigService) {
  //   const client = new InfluxDB({
  //     url: configService.get('INFLUX_URL') || '',
  //     token: configService.get('INFLUX_TOKEN'),
  //   });

  //   this.writeApi = client.getWriteApi(
  //     configService.get('INFLUX_ORG') || '',
  //     configService.get('INFLUX_BUCKET') || '',
  //     'ms',
  //   );

  //   // 配置数据点格式
  //   this.writeApi.useDefaultTags({
  //     region: 'east-1',
  //     version: '1.0',
  //   });
  // }

  async writePerformance(data: PerformanceDTO) {
    const point = new Point('web_perf')
      .tag('project', data.project)
      .tag('url', data.url)
      .floatField('fcp', data.fcp)
      .floatField('lcp', data.lcp)
      .floatField('fid', data.fid)
      .floatField('cls', data.cls)
      .floatField('ttfb', data.ttfb)
      .timestamp(new Date());

    this.writeApi.writePoint(point);
    await this.writeApi.flush();
  }

  onModuleInit() {
    this.influxClient = new InfluxDB({
      url: this.config.url,
      token: this.config.token,
    });

    this.writeApi = this.influxClient.getWriteApi(
      this.config.org,
      this.config.bucket,
      'ns', // 时间精度：纳秒
    );
  }

  onModuleDestroy() {
    this.writeApi.close().catch(console.error);
  }

  // 写入单点数据
  writePoint(point: Point): void {
    this.writeApi.writePoint(point);
  }

  // 批量写入数据
  writePoints(points: Point[]): void {
    points.forEach((point) => this.writeApi.writePoint(point));
    this.writeApi.flush().catch(console.error);
  }

  // 执行查询
  async query<T>(query: string): Promise<T[]> {
    const queryApi = this.influxClient.getQueryApi(this.config.org);
    const results: T[] = [];

    return new Promise((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row) as T;
          results.push(result);
        },
        error(err) {
          reject(err);
        },
        complete() {
          resolve(results);
        },
      });
    });
  }
}
