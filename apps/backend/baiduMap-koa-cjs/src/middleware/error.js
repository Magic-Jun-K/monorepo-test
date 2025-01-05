/**
 * 错误处理中间件
 * 统一处理应用中的错误
 */
const logger = require('../utils/logger');

/**
 * 全局错误处理中间件
 * @param {Object} ctx Koa上下文
 * @param {Function} next 下一个中间件
 */
async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    // 记录错误日志
    logger.error('Application error:', {
      error: err.message,
      stack: err.stack,
      url: ctx.url,
      method: ctx.method,
      body: ctx.request.body,
      headers: ctx.headers,
    });

    // 设置状态码
    ctx.status = err.status || 500;

    // 构造错误响应
    const response = {
      success: false,
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production'
          ? 'An internal server error occurred'
          : err.message,
      },
    };

    // 在开发环境下添加错误堆栈
    if (process.env.NODE_ENV === 'development') {
      response.error.stack = err.stack;
    }

    // 设置响应体
    ctx.body = response;

    // 触发应用级错误事件
    ctx.app.emit('error', err, ctx);
  }
}

module.exports = errorHandler;
