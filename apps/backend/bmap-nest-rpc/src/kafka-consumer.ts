import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';

@Injectable()
export class KafkaConsumer implements OnModuleInit {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

  async onModuleInit() {
    // 订阅主题
    this.kafkaClient.subscribeToResponseOf('auth.events');
    this.kafkaClient.subscribeToResponseOf('user.events');
    await this.kafkaClient.connect();
  }

  @MessagePattern('auth.events')
  async handleAuthEvents(@Payload() _message: unknown) {
    // 处理认证相关事件
    // 例如：记录日志、更新统计信息等
    // 可以使用logger替代console.log
    return { processed: true, type: 'auth' };
  }

  @MessagePattern('user.events')
  async handleUserEvents(@Payload() _message: unknown) {
    // 处理用户相关事件
    // 例如：发送通知、更新用户状态等
    // 可以使用logger替代console.log
    return { processed: true, type: 'user' };
  }
}
