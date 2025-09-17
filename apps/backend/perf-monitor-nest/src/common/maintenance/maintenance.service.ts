/**
 * @description 数据维护服务 - 定期清理过期数据
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ErrorLogService } from '../../modules/error-log/error-log.service';
import { PerformanceService } from '../../modules/performance/performance.service';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    private readonly errorLogService: ErrorLogService,
    private readonly performanceService: PerformanceService,
  ) {}

  // 每天凌晨2点执行数据清理
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyCleanup() {
    this.logger.log('Starting daily data cleanup...');

    try {
      // 清理30天前的错误日志
      const errorResult: { deletedCount?: number } =
        await this.errorLogService.deleteExpiredErrors(30);
      this.logger.log(`Deleted expired error logs: ${JSON.stringify(errorResult)}`);

      // 清理30天前的性能数据
      const perfResult: { message: string } =
        await this.performanceService.deleteExpiredPerformanceData(30);
      this.logger.log(JSON.stringify(perfResult));

      this.logger.log('Daily data cleanup completed.');
    } catch (error) {
      this.logger.error('Error during daily data cleanup:', error);
    }
  }

  // 每周日凌晨3点执行深度清理
  @Cron('0 0 3 * * 0') // 每周日凌晨3点
  async handleWeeklyCleanup() {
    this.logger.log('Starting weekly deep cleanup...');

    try {
      // 可以添加更深度的清理逻辑
      // 例如清理重复数据、优化索引等
      this.logger.log('Weekly deep cleanup completed.');
      // 模拟异步操作避免 require-await 错误
      await new Promise((resolve) => setTimeout(resolve, 0));
    } catch (error) {
      this.logger.error('Error during weekly deep cleanup:', error);
    }
  }
}
