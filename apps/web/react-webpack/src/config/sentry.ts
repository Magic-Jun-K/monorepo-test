import { BrowserOptions } from '@sentry/react';

// 声明 process 类型以避免 TypeScript 错误
declare const process: {
  env: {
    SENTRY_DSN?: string;
    APP_VERSION?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
  };
};

// Sentry 配置
export const sentryConfig: BrowserOptions = {
  dsn: (typeof process !== 'undefined' && process.env && process.env.SENTRY_DSN) || 'https://89f7621f48c7fa98c40d0027ef411518@o4508624159244288.ingest.de.sentry.io/4508624202104912',
  
  // 发布版本
  release: (typeof process !== 'undefined' && process.env && process.env.APP_VERSION) || 'dev',
  
  // 环境标识
  environment: (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'development',
  
  // 设置采样率
  tracesSampleRate: (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') ? 0.2 : 1,
  
  // 页面加载性能监控采样率
  profilesSampleRate: (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') ? 0.2 : 1,
  
  // 是否启用自动性能监控
  integrations: [],
  
  // 忽略特定错误
  ignoreErrors: [
    // 忽略 ResizeObserver 错误
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // 忽略特定网络错误
    'Network Error',
    'Failed to fetch',
    'Load failed'
  ],
  
  // 忽略特定 URL 的错误
  denyUrls: [
    // Chrome 扩展程序错误
    /extensions\//i,
    /^chrome:\/\//i,
    // 忽略本地文件错误
    /file:\/\//i
  ]
};
