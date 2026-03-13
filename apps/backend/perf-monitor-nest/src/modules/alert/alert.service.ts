/**
 * @description 报警模块 (alert) - 报警规则配置
 */
import { Injectable } from '@nestjs/common';
import { ClickHouseService } from '../../database/clickhouse/clickhouse.service';

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

  constructor(private readonly clickhouseService: ClickHouseService) {
    // 注册报警规则
    this.registerRule('lcp', {
      threshold: 2500,
      window: '5m',
      triggerCount: 3,
    });
  }

  /**
   * 注册报警规则
   * @param metric 指标名称
   * @param rule 报警规则
   */
  registerRule(metric: string, rule: AlertRule) {
    this.alertRules.set(metric, rule);
  }

  /**
   * 检查LCP指标的报警规则
   * @param data 性能数据
   */
  async checkLCPAlert(data: PerformanceDTO) {
    const rule = this.alertRules.get('lcp');
    if (!rule || !data.lcp) return;

    const count = await this.getViolationCount(
      'lcp',
      data.projectId,
      data.url,
      rule.threshold,
      rule.window,
    );

    if (count >= rule.triggerCount) {
      this.triggerAlert({
        type: 'performance',
        metric: 'lcp',
        project: data.projectId,
        url: data.url,
        value: data.lcp,
        threshold: rule.threshold,
      });
    }
  }

  /**
   * 获取指标在指定时间窗口内的违规次数
   * @param metric 指标名称
   * @param project 项目ID
   * @param url URL
   * @param threshold 阈值
   * @param window 时间窗口
   * @returns 违规次数
   */
  private async getViolationCount(
    metric: string,
    project: string,
    url: string,
    threshold: number,
    window: string,
  ): Promise<number> {
    const query = `
      SELECT count() AS count
      FROM web_perf
      WHERE project_id = {project:String}
        AND url = {url:String}
        AND ${metric} > {threshold:Float32}
        AND timestamp >= now() - INTERVAL ${window}
    `;

    try {
      const results = await this.clickhouseService.query<{ count: number }>(query, {
        project,
        url,
        threshold,
      });
      return results.length > 0 ? results[0].count : 0;
    } catch (error) {
      console.error('Error querying violation count:', error);
      return 0;
    }
  }

  /**
   * 定期检查所有报警规则
   */
  async runPeriodicChecks(): Promise<void> {
    console.warn('Running periodic alert checks...');
    // 这里应该实现定期检查逻辑
    // 例如，查询最近一段时间内的性能数据并检查是否触发报警

    // 模拟异步操作避免 require-await 错误
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  /**
   * 触发报警
   * @param alert 报警信息
   */
  private triggerAlert(alert: AlertPayload) {
    // 发送邮件/钉钉通知
    // 写入报警日志
    console.warn('Alert triggered:', alert);

    // 这里应该实现实际的通知逻辑
    // 例如发送邮件、短信或调用 webhook
  }

  /**
   * 检查指定指标的报警规则
   * @param metric 指标名称
   * @param data 性能数据
   */
  async checkMetricAlert(metric: string, data: PerformanceDTO) {
    const rule = this.alertRules.get(metric);
    if (!rule) return;

    const metricValue = data[metric as keyof PerformanceDTO];
    if (typeof metricValue !== 'number') return;

    const count = await this.getViolationCount(
      metric,
      data.projectId,
      data.url,
      rule.threshold,
      rule.window,
    );

    if (count >= rule.triggerCount) {
      this.triggerAlert({
        type: 'performance',
        metric: metric,
        project: data.projectId,
        url: data.url,
        value: metricValue,
        threshold: rule.threshold,
      });
    }
  }

  /**
   * 获取所有报警规则
   * @returns 所有报警规则的记录
   */
  getAllRules(): Record<string, AlertRule> {
    const rules: Record<string, AlertRule> = {};
    this.alertRules.forEach((value, key) => {
      rules[key] = value;
    });
    return rules;
  }

  /**
   * 更新指定指标的报警规则
   * @param metric 指标名称
   * @param rule 新的报警规则
   * @returns 是否更新成功
   */
  updateRule(metric: string, rule: AlertRule): boolean {
    if (this.alertRules.has(metric)) {
      this.alertRules.set(metric, rule);
      return true;
    }
    return false;
  }

  /**
   * 删除指定指标的报警规则
   * @param metric 指标名称
   * @returns 是否删除成功
   */
  removeRule(metric: string): boolean {
    return this.alertRules.delete(metric);
  }
}
