/**
 * 主服务器文件
 * 配置和启动Koa应用服务器
 */
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { send } from '@koa/send';
import helmet from 'koa-helmet';
import compress from 'koa-compress';
import { createClient } from 'redis';
import { constants } from 'node:zlib';

// 导入 types
import type { AppState, AppContext } from './types/index.ts';

// 导入配置和工具
import config from './config/index.ts';
import logger from './utils/logger.ts';
import errorHandler from './middleware/error.ts';
import rateLimiter from './middleware/rateLimit.ts';
import cors from './middleware/cors.ts';

// 导入数据库服务
import { connectDatabase, disconnectDatabase, getPool } from './services/database.ts';

// 导入路由
import imageRoutes from './routes/imageRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import authRoutes from './routes/authRoutes.ts';

// 创建Koa应用实例
const app: Koa<AppState, AppContext> = new Koa();

// 初始化Redis客户端
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD
});

// 安全中间件 - 最先注册
app.use(helmet.default());
app.use(errorHandler);

// 使用独立的CORS中间件
app.use(cors());

// 添加数据库连接状态检查
app.use(async (ctx, next) => {
  ctx.state.db = getPool();
  await next();
});

// 自定义头部和安全中间件
app.use(async (ctx, next) => {
  ctx.set('X-Timestamp', Date.now().toString());
  ctx.set('X-Content-Type-Options', 'nosniff');
  ctx.set('X-Frame-Options', 'DENY');
  ctx.set('X-XSS-Protection', '1; mode=block');
  await next();
});

// 配置静态资源服务
app.use(async ctx => {
  await send(ctx, ctx.path, {
    root: './public/images',
    maxage: 86400000 // 24 hours(24 * 60 * 60 * 1000)
  });
});

// 压缩响应
app.use(
  compress({
    threshold: 2048, // 2kb以上的响应进行压缩
    gzip: {
      flush: constants.Z_SYNC_FLUSH
    },
    deflate: {
      flush: constants.Z_SYNC_FLUSH
    },
    br: false // 禁用br压缩，因为IE不支持
  })
);

// 请求体解析
app.use(bodyParser());

// 速率限制
app.use(rateLimiter);

// 注册路由
app.use(imageRoutes.routes());
app.use(imageRoutes.allowedMethods());
app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());
app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());

// 未找到路由的处理
app.use(async ctx => {
  ctx.status = 404;
  ctx.body = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found'
    }
  };
});

// 错误事件监听
app.on('error', (err, ctx) => {
  logger.error('Server error:', {
    error: err.message,
    stack: err.stack,
    url: ctx.url,
    method: ctx.method
  });
});

// 启动服务器
const port = config.server.port;
app.listen(port, async () => {
  try {
    await connectDatabase();
    await redisClient.connect();
    console.log(`服务端启动成功，端口:${port}`);
    logger.info(`Server is running on port ${port}`);
    logger.info(`Environment: ${config.server.env}`);
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
});

// 资源清理函数
async function cleanupResources() {
  // 清理其他资源
}

// 优雅关闭
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
  logger.info('Received shutdown signal');
  
  try {
    await disconnectDatabase();
    await redisClient.quit();
    await cleanupResources();
    logger.info('All resources closed successfully');
  } catch (err) {
    logger.error('Error during shutdown:', err);
  } finally {
    process.exit(0);
  }
}
