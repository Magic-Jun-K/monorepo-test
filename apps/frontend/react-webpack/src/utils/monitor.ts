import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';
import { startInactiveSpan, setTag } from '@sentry/react';

// 监控配置接口
interface MonitorConfig {
  reportUrl: string;
  errorReportUrl?: string;
  appId: string;
  userId?: string;
  enableSentry?: boolean;
}

// 性能数据接口
interface PerformanceData {
  projectId: string;
  url: string;
  timestamp: number;
  env: string;
  browser: string;
  fcp?: number;
  lcp?: number;
  cls?: number;
  inp?: number;
  ttfb?: number;
  resources?: ResourceData[];
  navigation?: NavigationData;
  pageId: string;
  [key: string]: unknown;
}

interface ResourceData {
  name: string;
  type: string;
  duration: number;
  transferSize: number;
}

interface NavigationData {
  ttfb: number;
  domContentLoaded: number;
  windowLoad: number;
  resourceCount: number;
}

// 生成唯一页面ID
const generatePageId = () => {
  return 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
};

// 获取浏览器名称
const getBrowserName = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
};

export class Monitor {
  private config: MonitorConfig;
  private metrics: Partial<PerformanceData> = {};
  private reportTimeout: NodeJS.Timeout | null = null;
  private pageId: string;

  constructor(config: MonitorConfig) {
    this.config = config;
    this.pageId = generatePageId();
    this.initPerformanceObserver();
    // 页面加载完成后收集导航和资源数据
    if (document.readyState === 'complete') {
      this.scheduleCollectWindowPerformance();
    } else {
      window.addEventListener('load', () => {
        this.scheduleCollectWindowPerformance();
      });
    }
  }

  // 初始化性能监控
  private initPerformanceObserver() {
    onFCP(this.handleMetric);
    onLCP(this.handleMetric);
    onCLS(this.handleMetric);
    onTTFB(this.handleMetric);
    onINP(this.handleMetric);
  }

  // 调度性能数据采集（使用空闲时间）
  private scheduleCollectWindowPerformance() {
    // 延迟采集，避免阻塞主线程
    const collect = () => this.collectWindowPerformance();

    // 对于不支持 requestIdleCallback 的浏览器降级到 setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(collect, { timeout: 5000 });
    } else {
      setTimeout(collect, 100);
    }
  }

  // 收集 Navigation Timing 和 Resource Timing
  private collectWindowPerformance() {
    if (!('performance' in window)) return;

    // 1. Navigation Timing
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const perfData = navEntries[0] as PerformanceNavigationTiming;
      this.metrics.navigation = {
        ttfb: perfData.responseStart - perfData.requestStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        windowLoad: perfData.loadEventEnd - perfData.fetchStart,
        resourceCount: performance.getEntriesByType('resource').length,
      };

      // Sentry 上报 Navigation
      if (this.config.enableSentry) {
        const span = startInactiveSpan({ name: 'Page Load', op: 'pageload' });
        span?.setAttributes({
          'measurement.ttfb': this.metrics.navigation.ttfb,
          'measurement.domContentLoaded': this.metrics.navigation.domContentLoaded,
          'measurement.windowLoad': this.metrics.navigation.windowLoad,
        });
        span?.end();
      }
    }

    // 2. Resource Timing (只采集关键资源)
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const keyResources = resources
      .filter((r) => ['script', 'link', 'img', 'fetch', 'xmlhttprequest'].includes(r.initiatorType))
      .map((r) => ({
        name: r.name,
        type: r.initiatorType,
        duration: r.duration,
        transferSize: r.transferSize,
      }));

    if (keyResources.length > 0) {
      this.metrics.resources = keyResources;
    }

    this.scheduleReport();
  }

  // 处理 Web Vitals 指标
  private handleMetric = (metric: Metric) => {
    const { name, value } = metric;

    // 映射指标名称到后端字段
    switch (name) {
      case 'FCP':
        this.metrics.fcp = value;
        break;
      case 'LCP':
        this.metrics.lcp = value;
        break;
      case 'CLS':
        this.metrics.cls = value;
        break;
      case 'TTFB':
        this.metrics.ttfb = value;
        break;
      case 'INP':
        this.metrics.inp = value;
        break;
    }

    // Sentry 上报 Web Vitals
    if (this.config.enableSentry) {
      const span = startInactiveSpan({ name: `Web Vitals - ${name}`, op: 'perf.metric' });
      span?.setAttributes({
        [`measurement.${name}`]: value,
        'measurement.unit': 'millisecond',
      });
      span?.end();
      setTag(`web-vital-${name}`, metric.rating);
    }

    // 每次收集到指标后调度上报（防抖）
    this.scheduleReport();
  };

  // 调度上报（防抖 + 空闲时间）
  private scheduleReport() {
    if (this.reportTimeout) clearTimeout(this.reportTimeout);
    // 防抖上报，避免过于频繁
    this.reportTimeout = setTimeout(() => {
      // 使用空闲时间上报，避免阻塞主线程
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => this.report(), { timeout: 3000 });
      } else {
        this.report();
      }
    }, 2000);
  }

  // 上报数据
  public report() {
    if (Object.keys(this.metrics).length === 0) return;

    const data: PerformanceData = {
      projectId: this.config.appId,
      pageId: this.pageId,
      url: window.location.href,
      timestamp: Date.now(),
      env: process.env.NODE_ENV || 'production',
      browser: getBrowserName(),
      ...this.metrics,
      userId: this.config.userId,
      userAgent: navigator.userAgent,
    };

    // 使用 sendBeacon 保证在页面卸载时也能发送
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const success = navigator.sendBeacon(this.config.reportUrl, blob);

    // 如果 sendBeacon 失败（比如数据量过大），降级到 fetch
    if (!success) {
      fetch(this.config.reportUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(console.error);
    }

    // 上报后清空已上报的资源数据，避免重复
    // 注意：累计型指标(CLS)可能需要保留，这里简单处理，清空 resources
    delete this.metrics.resources;
    delete this.metrics.navigation;
  }

  // 错误上报
  public reportError(error: Error, context?: unknown) {
    const errorInfo = {
      type: error.name,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      projectId: this.config.appId,
      userId: this.config.userId,
    };

    // 使用配置的错误上报地址，或者根据性能上报地址推导
    const errorReportUrl =
      this.config.errorReportUrl || this.config.reportUrl.replace('performance', 'error');
    navigator.sendBeacon(
      errorReportUrl,
      new Blob([JSON.stringify(errorInfo)], { type: 'application/json' }),
    );
  }
}

// 单例模式导出
let monitorInstance: Monitor;

// 初始化监控器
export const initMonitor = (config: MonitorConfig) => {
  if (!monitorInstance) {
    monitorInstance = new Monitor(config);
  }
  return monitorInstance;
};

// 错误监控和上报
export const reportError = (error: Error, context?: unknown) => {
  if (monitorInstance) {
    monitorInstance.reportError(error, context);
  } else {
    console.error('[Monitor Not Initialized]', error);
  }
};
