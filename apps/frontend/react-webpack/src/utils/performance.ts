// 性能监控模块示例
import { Metric, onCLS, onFCP, onINP, onLCP } from 'web-vitals';
import { startInactiveSpan, setTag } from '@sentry/react';

// 声明 process 类型以避免 TypeScript 错误
declare const process: {
  env: {
    NODE_ENV?: 'development' | 'production' | 'test';
  };
};

// 采样率配置（生产环境10%）
const SAMPLING_RATE = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production' ? 0.1 : 1;

// 采样率判断
const shouldSample = () => Math.random() < SAMPLING_RATE;

// 1. 数据上报函数
const sendToAnalytics = (metric: Metric) => {
  if (!shouldSample()) return;

  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    id: metric.id,
    delta: metric.delta,
    entries: metric.entries,
    navigationType: metric.navigationType
  };

  // 使用 navigator.sendBeacon 或 fetch 上报
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });

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
  
  // 在Sentry中添加标签
  setTag(`web-vital-${metric.name}`, metric.rating);
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
    // 在Sentry中设置性能问题标签
    setTag('perf-issue', `${metric.name}-slow`);
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

// 5. 自定义性能监控 - 页面加载时间
export const measurePageLoad = () => {
  if ('performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (perfData) {
      const span = startInactiveSpan({
        name: 'Page Load',
        op: 'pageload'
      });
      
      span?.setAttributes({
        'measurement.ttfb': perfData.responseStart - perfData.requestStart,
        'measurement.domContentLoaded': perfData.domContentLoadedEventEnd - perfData.fetchStart,
        'measurement.windowLoad': perfData.loadEventEnd - perfData.fetchStart,
        'measurement.resourceCount': performance.getEntriesByType('resource').length
      });
      
      span?.end();
    }
  }
};

// 6. 自定义性能监控 - 资源加载时间
export const measureResourceLoad = () => {
  if ('performance' in window) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    resources.forEach(resource => {
      // 只监控重要的资源类型
      if (resource.initiatorType === 'script' || resource.initiatorType === 'link' || resource.initiatorType === 'img') {
        const span = startInactiveSpan({
          name: `Resource Load: ${resource.name}`,
          op: `resource.${resource.initiatorType}`
        });
        
        span?.setAttributes({
          'resource.name': resource.name,
          'resource.type': resource.initiatorType,
          'measurement.duration': resource.duration,
          'measurement.transferSize': resource.transferSize,
          'measurement.encodedBodySize': resource.encodedBodySize
        });
        
        span?.end();
      }
    });
  }
};
