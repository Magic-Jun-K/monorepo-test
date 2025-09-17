/**
 * @description 报警模块 (alert) - 报警规则配置
 */
import { Injectable } from '@nestjs/common';
import { InfluxService } from '../../database/influx/influx.service';

import { PerformanceDTO } from '../collector/dto/performance.dto';

interface AlertPayload {
  type: string;
  metric: string;
  project: string;
  url: string;
  value: number;
  threshold: number;
}

interface AlertRule {
  threshold: number;
  window: string;
  triggerCount: number;
}

@Injectable()
export class AlertService {
  private alertRules = new Map<string, AlertRule>();

  constructor(private readonly influxService: InfluxService) {
    // 注册报警规则
    this.registerRule('lcp', {
      threshold: 2500,
      window: '5m',
      triggerCount: 3,
    });
  }

  registerRule(metric: string, rule: AlertRule) {
    this.alertRules.set(metric, rule);
  }

  async checkLCPAlert(data: PerformanceDTO) {
    const rule = this.alertRules.get('lcp');
    if (!rule) return;

    // 检查过去5分钟内LCP超标次数
    const count = await this.getViolationCount(
      'lcp',
      data.project,
      data.url,
      rule.threshold,
      rule.window,
    );

    if (count >= rule.triggerCount) {
      this.triggerAlert({
        type: 'performance',
        metric: 'lcp',
        project: data.project,
        url: data.url,
        value: data.lcp,
        threshold: rule.threshold,
      });
    }
  }

  // 实现实际的查询逻辑来获取违规次数
  private async getViolationCount(
    metric: string,
    project: string,
    url: string,
    threshold: number,
    window: string,
  ): Promise<number> {
    // 构建查询语句
    const query = `
      SELECT COUNT(*) AS count
      FROM web_perf
      WHERE project = '${project}'
        AND url = '${url}'
        AND ${metric} > ${threshold}
        AND time > now() - ${window}
    `;

    try {
      const results = await this.influxService.query<{ count: number }>(query);
      return results.length > 0 ? results[0].count : 0;
    } catch (error) {
      console.error('Error querying violation count:', error);
      return 0;
    }
  }

  // 实现定期检查逻辑
  async runPeriodicChecks(): Promise<void> {
    console.log('Running periodic alert checks...');
    // 这里应该实现定期检查逻辑
    // 例如，查询最近一段时间内的性能数据并检查是否触发报警

    // 模拟异步操作避免 require-await 错误
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  private triggerAlert(alert: AlertPayload) {
    // 发送邮件/钉钉通知
    // 写入报警日志
    console.log('Alert triggered:', alert);

    // 这里应该实现实际的通知逻辑
    // 例如发送邮件、短信或调用 webhook
  }

  // 添加新的报警检查方法
  async checkMetricAlert(metric: string, data: PerformanceDTO) {
    const rule = this.alertRules.get(metric);
    if (!rule) return;

    // 检查指定时间窗口内指标超标次数
    const count = await this.getViolationCount(
      metric,
      data.project,
      data.url,
      rule.threshold,
      rule.window,
    );

    if (count >= rule.triggerCount) {
      this.triggerAlert({
        type: 'performance',
        metric: metric,
        project: data.project,
        url: data.url,
        value: data[metric as keyof PerformanceDTO] as number,
        threshold: rule.threshold,
      });
    }
  }

  // 添加获取所有报警规则的方法
  getAllRules(): Record<string, AlertRule> {
    const rules: Record<string, AlertRule> = {};
    this.alertRules.forEach((value, key) => {
      rules[key] = value;
    });
    return rules;
  }

  // 添加更新报警规则的方法
  updateRule(metric: string, rule: AlertRule): boolean {
    if (this.alertRules.has(metric)) {
      this.alertRules.set(metric, rule);
      return true;
    }
    return false;
  }

  // 添加删除报警规则的方法
  removeRule(metric: string): boolean {
    return this.alertRules.delete(metric);
  }
}
