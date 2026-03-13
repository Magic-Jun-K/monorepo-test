import { KafkaOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

/**
 * Kafka 基础配置（Broker, Retry 等）
 */
export const KAFKA_COMMON_CONFIG = {
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  retry: {
    retries: 10,
    initialRetryTime: 1000,
    maxRetryTime: 30000,
  },
};

/**
 * Kafka 消费者组 ID
 */
export const KAFKA_CONSUMER_GROUP_ID = 'perf-monitor-consumer-group';

/**
 * NestJS Microservice (Server) 配置
 * 用于 main.ts 中 app.connectMicroservice
 */
export const kafkaMicroserviceConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      ...KAFKA_COMMON_CONFIG,
      clientId: 'perf-monitor-server',
    },
    consumer: {
      groupId: KAFKA_CONSUMER_GROUP_ID,
      allowAutoTopicCreation: true,
    },
    producer: {
      createPartitioner: Partitioners.LegacyPartitioner,
      allowAutoTopicCreation: true,
    },
  },
};

/**
 * NestJS Client (Producer) 配置
 * 用于 KafkaModule 中 ClientsModule.register
 */
export const kafkaClientConfig: KafkaOptions['options'] = {
  client: {
    ...KAFKA_COMMON_CONFIG,
    clientId: 'perf-monitor-client',
  },
  consumer: {
    groupId: 'perf-monitor-producer-group', // Client 端通常使用不同的 Group 或不需要 Consumer
    allowAutoTopicCreation: true,
  },
  producer: {
    createPartitioner: Partitioners.LegacyPartitioner,
    allowAutoTopicCreation: true,
  },
};
