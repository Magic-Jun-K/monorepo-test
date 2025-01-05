/**
 * 主服务器文件
 * 配置和启动Koa应用服务器
 */
const Koa = require('koa');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const { send } = require('@koa/send');
const helmet = require('koa-helmet');
const compress = require('koa-compress');
// const cors = require('@koa/cors');
// const path = require('path');

// 导入配置和工具
const config = require('./src/config');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/error');
const rateLimiter = require('./src/middleware/rateLimit');

// 导入路由
const imageRoutes = require('./src/routes/imageRoutes');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');

// 创建Koa应用实例
const app = new Koa();

// CORS配置
// app.use(cors(config.cors));

// Enhanced CORS middleware
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', 'http://localhost:3000'); // Allow all origins
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow specific methods
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
  ctx.set('Cross-Origin-Resource-Policy', 'cross-origin'); // Allow cross-origin resource sharing

  await next();
});

// 手动配置 CORS 中间件
// app.use(async (ctx, next) => {
//   console.log("测试请求源", ctx.get('Origin'));
//   ctx.set('Access-Control-Allow-Origin', ctx.get('Origin') || '*'); // Allow the request origin
//   ctx.set('Access-Control-Allow-Credentials', 'true'); // Allow credentials
//   ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allowed methods
//   ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept'); // Allowed headers

//   // Handle preflight requests(处理飞行前请求)
//   if (ctx.method === 'OPTIONS') {
//     ctx.status = 204; // No content
//     return;
//   }

//   await next(); // Proceed to the next middleware(继续下一个中间件)
// });

// 连接数据库
mongoose
  .connect(config.database.url)
  .then(() => logger.info('Successfully connected to MongoDB'))
  .catch(err => {
    logger.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// 应用中间件
app.use(errorHandler); // 错误处理必须是第一个中间件

// 安全中间件
app.use(helmet()); // 设置安全相关的HTTP头

// 自定义头部中间件
app.use(async (ctx, next) => {
  ctx.set('X-Timestamp', Date.now());
  await next();
});
// 配置静态资源服务
app.use(async ctx => {
  await send(ctx, ctx.path, {
    root: __dirname + '/public/images',
    maxage: 24 * 60 * 60 * 1000 // 24 hours
  });
});

// 压缩响应
app.use(
  compress({
    threshold: 2048, // 2kb以上的响应进行压缩
    gzip: {
      flush: require('zlib').constants.Z_SYNC_FLUSH
    },
    deflate: {
      flush: require('zlib').constants.Z_SYNC_FLUSH
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
app.listen(port, () => {
  console.log(`服务端启动成功，端口:${port}`);
  logger.info(`Server is running on port ${port}`);
  logger.info(`Environment: ${config.server.env}`);
});

// 优雅关闭
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
  logger.info('Received shutdown signal');

  // 关闭数据库连接
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (err) {
    logger.error('Error closing MongoDB connection:', err);
  }

  // 关闭服务器
  process.exit(0);
}
