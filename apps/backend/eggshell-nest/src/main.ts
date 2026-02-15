/**
 * @description 入口文件
 */
import { NestFactory /* , Reflector */ } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
// import compression from 'compression';
// import zlib from 'node:zlib';

import { AppModule } from './app.module';
// import { LoggerMiddleware } from './middlewares/LoggerMiddleware';
import { HttpErrorFilter } from './common/filters/exception.filter';
// import { DetailPipe } from './common/pipes/DetailPipe';
// import { AuthGuard } from './common/guards/auth.guard';

// 设置时区为东八区
process.env.TZ = 'Asia/Shanghai';

const PROD_ORIGIN = ['https://eggshell.asia', 'https://www.eggshell.asia'];
const DEV_ORIGIN = [...PROD_ORIGIN, 'http://localhost:3000', 'http://localhost:5173'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 添加 cookie 解析中间件
  app.use(cookieParser());

  // 启用压缩（优先使用 Brotli，降级到 gzip）
  // app.use(
  //   compression({
  //     threshold: 1024, // 大于 1KB 的响应才压缩
  //     filter: (req, res) => {
  //       // 允许通过请求头跳过压缩（用于调试）
  //       if (req.headers['x-no-compression']) {
  //         return false;
  //       }
  //       return compression.filter(req, res); // 使用默认过滤逻辑
  //     },
  //     level: 6, // gzip 压缩级别（1-9，6 是平衡性能和压缩率的推荐值）
  //     memLevel: 8, // 内存级别（1-9，8 是推荐值）
  //     chunkSize: 16384, // 压缩块大小（16KB）
  //     // Brotli 配置（只要提供此对象就自动启用）
  //     brotli: {
  //       params: {
  //         [zlib.constants.BROTLI_PARAM_QUALITY]: 11, // Brotli 质量（0-11，11 是最高压缩率）
  //         [zlib.constants.BROTLI_PARAM_SIZE_HINT]: 16384, // 预估的响应大小（16KB）
  //       },
  //     },
  //   }),
  // );

  // app.useGlobalInterceptors(new LoggerMiddleware());

  app.useGlobalFilters(new HttpErrorFilter());

  // app.useGlobalPipes(new DetailPipe());

  // const reflector = app.get(Reflector);
  // app.useGlobalGuards(new AuthGuard(reflector));
  logger.log('process.env.NODE_ENV', process.env.NODE_ENV);

  // 启用 CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? PROD_ORIGIN : DEV_ORIGIN,
    methods: 'GET,POST,HEAD,PUT,PATCH,DELETE',
    credentials: true, // 允许携带 cookie
  });
  logger.log('process.env.PORT', process.env.PORT);

  await app.listen(process.env.PORT ?? 7000);
}
bootstrap();
