import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WebVitalsDTO } from './analytics.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * 处理来自前端的 Web Vitals 数据
   * @param data Web Vitals 数据
   */
  async handleWebVitals(data: WebVitalsDTO): Promise<void> {
    try {
      // 获取 perf-monitor-nest 服务地址
      // perf-monitor-nest 默认运行在端口 7002
      const perfMonitorUrl = process.env.PERF_MONITOR_URL || 'http://localhost:7002';

      // 构造要发送到 perf-monitor-nest 的数据格式
      // 根据 perf-monitor-nest 的 PerformanceDTO 定义构造数据
      const perfData = {
        project: 'bmap-frontend',
        url: '', // 前端未提供URL信息
        // 将 Web Vitals 指标映射到 perf-monitor-nest 期望的字段
        [data.name.toLowerCase()]: data.value, // fcp, lcp, cls等
        fid: 0, // First Input Delay，Web Vitals 中没有直接提供
        ttfb: 0, // Time to First Byte，Web Vitals 中没有直接提供
        resources: [], // 资源信息，Web Vitals 中没有直接提供
      };

      // 发送到 perf-monitor-nest 服务
      const _response = await firstValueFrom(
        this.httpService.post(`${perfMonitorUrl}/collect/performance`, perfData),
      );

      this.logger.log(`Successfully forwarded analytics data to perf-monitor: ${data.name}`);
    } catch (error) {
      this.logger.error('Failed to forward analytics data to perf-monitor:', error);
      // 在生产环境中，你可能想要将这个错误记录到日志系统中
    }
  }
}
