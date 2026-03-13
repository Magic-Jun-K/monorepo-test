import { VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Kafka } from 'kafkajs';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { kafkaMicroserviceConfig, KAFKA_COMMON_CONFIG } from './common/kafka/kafka.config';

async function bootstrap() {
  // 预先创建 Kafka Topics，防止首次启动报错
  const kafka = new Kafka({
    clientId: 'perf-monitor-admin',
    ...KAFKA_COMMON_CONFIG,
  });

  const admin = kafka.admin();
  try {
    await admin.connect();
    const topics = await admin.listTopics();
    const topicsToCreate = ['performance_data', 'error_log'].filter((t) => !topics.includes(t));

    if (topicsToCreate.length > 0) {
      console.warn(`Creating topics: ${topicsToCreate.join(', ')}`);
      await admin.createTopics({
        topics: topicsToCreate.map((topic) => ({
          topic,
          numPartitions: 1,
          replicationFactor: 1,
        })),
      });
      console.warn('Topics created successfully');
    }
  } catch (error) {
    console.warn('Failed to auto-create topics, skipping...', error);
  } finally {
    await admin.disconnect();
  }

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // 启用版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  // 连接 Kafka 微服务
  app.connectMicroservice<MicroserviceOptions>(kafkaMicroserviceConfig);

  // 启动微服务
  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('性能监控平台 API')
    .setDescription('API 文档')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.useGlobalFilters(new HttpExceptionFilter());

  // 启用 CORS
  app.enableCors({
    origin: ['http://localhost:3000'], // 允许所有来源，生产环境请指定具体域名
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 7002);
}
bootstrap();
