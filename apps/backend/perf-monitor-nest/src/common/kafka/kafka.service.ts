import { Injectable, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

  /**
   * 模块初始化时连接 Kafka
   */
  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  /**
   * 模块销毁时关闭 Kafka 连接
   */
  async onModuleDestroy() {
    await this.kafkaClient.close();
  }

  /**
   * 发送事件到 Kafka
   * @param topic 主题
   * @param data 数据
   */
  emit<T = unknown>(topic: string, data: T) {
    return this.kafkaClient.emit(topic, data);
  }
}
