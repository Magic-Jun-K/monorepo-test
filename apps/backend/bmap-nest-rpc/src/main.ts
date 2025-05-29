/**
 * @description 入口文件
 */
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AppModule } from './app.module';
import { HttpErrorFilter } from './common/filters/exception.filter';
import { grpcConfig } from './config/grpc.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpErrorFilter());

  // 启用 CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://8.138.104.160',
    ],
    methods: 'GET,POST,HEAD,PUT,PATCH,DELETE',
    credentials: true, // 允许携带 cookie
  });

  // 配置gRPC微服务
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(process.cwd(), 'src/proto/auth.proto'),
      ...grpcConfig,
    },
  });
  // 启动HTTP和gRPC微服务
  await app.startAllMicroservices();
  console.log('✅ gRPC微服务已启动');

  // 启动 HTTP 服务
  await app.listen(process.env.PORT ?? 7000);
  console.log(`✅ HTTP 服务已启动在端口 ${process.env.PORT ?? 7000}`);
  console.log('🚀 所有服务启动完成');
}
bootstrap();
