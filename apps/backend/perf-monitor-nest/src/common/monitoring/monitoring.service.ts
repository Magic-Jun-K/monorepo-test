/**
 * @description 监控服务
 */
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  recordApiLatency(data: { method: string; path: string; duration: number; status: number }) {
    // 这里可以扩展为写入数据库、推送到监控平台等
    this.logger.log(
      `API: ${data.method} ${data.path} | duration: ${data.duration}ms | status: ${data.status}`,
    );
  }

  recordApiError(data: { method: string; path: string; duration: number; status: number }) {
    // 这里可以扩展为写入数据库、推送到监控平台等
    this.logger.error(
      `API ERROR: ${data.method} ${data.path} | duration: ${data.duration}ms | status: ${data.status}`,
    );
  }
}
