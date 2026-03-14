import { reportError } from './monitor';

/**
 * 错误处理
 */
export const setupErrorHandlers = () => {
  // 捕获全局错误
  window.addEventListener('error', (event: ErrorEvent) => {
    // 上报错误到监控服务
    reportError(event.error || new Error(event.message), {
      type: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });

    console.error('全局错误拦截:', {
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
    // 显示兜底提示（不中断页面）
    event.preventDefault(); // 阻止默认崩溃行为
  });

  // 捕获未处理的 Promise 异常
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    // 上报错误到监控服务
    reportError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
      type: 'unhandled_rejection',
    });

    console.error('未处理的 Promise 异常:', event.reason);
    event.preventDefault(); // 阻止默认崩溃行为
  });
};
