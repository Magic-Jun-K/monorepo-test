/**
 * @description 入口文件
 */
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { join } from 'node:path';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { HttpErrorFilter } from './common/filters/exception.filter';
import { grpcConfig } from './config/grpc.config';

async function bootstrap() {
  const logger = new Logger('RpcServerMain');

  // 创建 HTTP 应用程序
  const httpApp = await NestFactory.create(AppModule);

  // 添加 cookie 解析中间件
  httpApp.use(cookieParser());

  // 使用全局过滤器
  httpApp.useGlobalFilters(new HttpErrorFilter());

  // 启用 CORS
  httpApp.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['http://eggshell.online', 'http://www.eggshell.online']
        : [
            'http://eggshell.online',
            'http://www.eggshell.online',
            'http://localhost:3000',
            'http://localhost:5173',
          ],
    methods: 'GET,POST,HEAD,PUT,PATCH,DELETE',
    credentials: true, // 允许携带 cookie
  });

  // 启动 HTTP 服务
  const port = process.env.PORT ?? 7100;
  await httpApp.listen(port);
  logger.log(`✅ HTTP 服务已启动在端口 ${port}`);

  // 创建 gRPC 微服务
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(process.cwd(), 'src/proto/auth.proto'),
      ...grpcConfig,
    },
  });

  // 启动gRPC微服务
  await grpcApp.listen();
  logger.log('✅ gRPC微服务已启动');
  logger.log('🚀 所有服务启动完成');
}
bootstrap();
