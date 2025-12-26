// 错误监控和上报
export const reportError = (error: Error, context?: unknown) => {
  // 1. 错误分类
  const errorType = error.name;
  const errorMessage = error.message;
  const errorStack = error.stack;

  // 2. 错误信息收集
  const errorInfo = {
    type: errorType,
    message: errorMessage,
    stack: errorStack,
    context,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // 3. 错误上报（可以上报到自己的监控系统或第三方服务如 Sentry）
  console.error('Error reported:', errorInfo);
  // 实际项目中这里会上报到监控系统
  // monitor.report(errorInfo);
};
