/**
 * @description 入口文件
 */
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AppModule } from './app.module';
import { HttpErrorFilter } from './common/filters/exception.filter';
import { grpcConfig } from './config/grpc.config';

async function bootstrap() {
  // 创建 HTTP 应用程序
  const httpApp = await NestFactory.create(AppModule);

  //  使用全局过滤器
  httpApp.useGlobalFilters(new HttpErrorFilter());

  // 启用 CORS
  httpApp.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://8.138.104.160',
    ],
    methods: 'GET,POST,HEAD,PUT,PATCH,DELETE',
    credentials: true, // 允许携带 cookie
  });

  // 启动 HTTP 服务
  await httpApp.listen(process.env.PORT ?? 7000);
  console.log(`✅ HTTP 服务已启动在端口 ${process.env.PORT ?? 7000}`);

  // 创建 gRPC 微服务
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: join(process.cwd(), 'src/proto/auth.proto'),
        ...grpcConfig,
      },
    },
  );

  // 启动gRPC微服务
  await grpcApp.listen();
  console.log('✅ gRPC微服务已启动');

  console.log('🚀 所有服务启动完成');
}
bootstrap();
