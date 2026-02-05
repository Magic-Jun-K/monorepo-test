// 性能监控模块示例
import { Metric, onCLS, onFCP, onINP, onLCP } from 'web-vitals';
import { startInactiveSpan } from '@sentry/react';

// 采样率配置（生产环境10%）
const SAMPLING_RATE = process.env.NODE_ENV === 'production' ? 0.1 : 1;

// 采样率判断
const shouldSample = () => Math.random() < SAMPLING_RATE;

// 1. 数据上报函数
const sendToAnalytics = (metric: Metric) => {
  if (!shouldSample()) return;

  // Sentry性能监控API
  const span = startInactiveSpan({
    name: `Web Vitals - ${metric.name}`,
    op: 'perf.metric'
  });

  // 设置指标名称和单位
  span?.setAttributes({
    [`measurement.${metric.name}`]: metric.value,
    'measurement.unit': 'millisecond'
  });

  // 结束span
  span?.end();
};

// 2. 核心指标监控
export const initWebVitals = () => {
  onFCP(sendToAnalytics); // 首次内容绘制
  onLCP(sendToAnalytics); // 最大内容绘制
  onCLS(sendToAnalytics); // 布局稳定性
  onINP(sendToAnalytics); // 交互延迟
};

// 3. 阈值告警配置
type ThresholdConfig = Partial<Record<Metric['name'], number>>;

// 性能阈值配置
const PERFORMANCE_THRESHOLDS: ThresholdConfig = {
  FCP: 1800,
  LCP: 2500,
  CLS: 0.1,
  INP: 200
} as const;

// 4. 异常检测逻辑
const checkPerformance = (metric: Metric) => {
  const threshold = PERFORMANCE_THRESHOLDS[metric.name];
  if (threshold && metric.value > threshold) {
    console.warn(`[性能告警] ${metric.name}: ${metric.value} (阈值: ${threshold})`);
    // 实际项目中这里调用告警服务
  }
};

// 性能监控初始化
export const initPerformanceChecker = () => {
  // 注册所有指标的阈值检查
  [onFCP, onLCP, onCLS, onINP].forEach(metric => {
    metric(checkPerformance);
  });
};
