/**
 * 错误处理
 */
export const setupErrorHandlers = () => {
  // 捕获全局错误
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('全局错误拦截:', { message, source, lineno, colno, error });
    // 显示兜底提示（不中断页面）
    return true; // 阻止默认崩溃行为
  };

  // 捕获未处理的 Promise 异常
  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    console.error('未处理的 Promise 异常:', event.reason);
    event.preventDefault(); // 阻止默认崩溃行为
  };
};
