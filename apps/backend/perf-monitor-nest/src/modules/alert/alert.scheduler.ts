import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AlertService } from './alert.service';

@Injectable()
export class AlertScheduler {
  constructor(private readonly alertService: AlertService) {}

  @Cron('*/5 * * * *') // 每5分钟执行一次
  async checkPerformanceAlerts() {
    await this.alertService.runPeriodicChecks();
  }
}
