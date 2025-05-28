/**
 * @description 入口文件
 */
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AppModule } from './app.module';
import { HttpErrorFilter } from './common/filters/exception.filter';

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
      package: 'auth', // 替换为原型包名称
      // 使用绝对路径，确保在开发和生产环境都能找到文件
      protoPath: join(process.cwd(), 'src/proto/auth.proto'),
      url: '0.0.0.0:5000',
      loader: {
        keepCase: true, // 保持字段名称的大小写
        longs: String, // 使用字符串表示长整型
        enums: String, // 使用字符串表示枚举类型
        defaults: true, // 使用默认值
        oneofs: true, // 使用 oneof
      },
      // credentials: null, // 禁用 SSL 证书验证
      // maxSendMessageLength: 1024 * 1024 * 2, // 设置最大发送消息长度
      // maxReceiveMessageLength: 1024 * 1024 * 2, // 设置最大接收消息长度
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
