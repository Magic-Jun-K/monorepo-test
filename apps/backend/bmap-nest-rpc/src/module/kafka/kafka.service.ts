import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

export interface KafkaEvent {
  eventType: string;
  data: unknown;
  timestamp: string;
  correlationId?: string; // 关联ID，用于跟踪请求
}

export interface KafkaConfig {
  defaultTopic: string; // 默认主题
  topics: Record<string, string>; // 不同事件类型对应的主题
  batchSize?: number; // 批量发送大小
  batchTimeout?: number; // 批量发送超时时间(毫秒)
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private eventBuffer: Record<string, KafkaEvent[]> = {};
  private batchTimeouts: Record<string, NodeJS.Timeout> = {};

  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

  /**
   * 初始化Kafka连接
   */
  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  /**
   * 模块销毁时调用，确保发送缓冲区中的消息被发送
   */
  async onModuleDestroy() {
    // 发送缓冲区中剩余的消息
    await this.flushAllBuffers();
    await this.kafkaClient.close();
  }

  /**
   * 发送认证事件
   * @param eventType 事件类型
   * @param data 事件数据
   * @param correlationId 关联ID
   */
  async sendAuthEvent(eventType: string, data: unknown, correlationId?: string) {
    const event: KafkaEvent = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    await this.kafkaClient.emit('auth.events', event);
  }

  /**
   * 发送用户事件
   * @param eventType 事件类型
   * @param data 事件数据
   * @param correlationId 关联ID
   */
  async sendUserEvent(eventType: string, data: unknown, correlationId?: string) {
    const event: KafkaEvent = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    await this.kafkaClient.emit('user.events', event);
  }

  /**
   * 发送自定义事件
   * @param topic 主题
   * @param eventType 事件类型
   * @param data 事件数据
   * @param correlationId 关联ID
   */
  async sendEvent(topic: string, eventType: string, data: unknown, correlationId?: string) {
    const event: KafkaEvent = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    await this.kafkaClient.emit(topic, event);
  }

  /**
   * 发送事件并根据配置处理批量发送
   * @param eventType 事件类型
   * @param data 事件数据
   * @param config Kafka配置
   * @param correlationId 关联ID
   */
  async sendEventWithConfig(
    eventType: string,
    data: unknown,
    config: KafkaConfig,
    correlationId?: string,
  ) {
    const event: KafkaEvent = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    // 根据事件类型确定主题
    const topic = config.topics[eventType] || config.defaultTopic;

    // 检查是否启用批量发送
    if (config.batchSize && config.batchSize > 1) {
      await this.sendBatchEvent(topic, event, config);
    } else {
      await this.kafkaClient.emit(topic, event);
    }
  }

  /**
   * 发送批量事件
   * @param topic 主题
   * @param event 事件
   * @param config Kafka配置
   */
  private async sendBatchEvent(topic: string, event: KafkaEvent, config: KafkaConfig) {
    // 初始化缓冲区
    if (!this.eventBuffer[topic]) {
      this.eventBuffer[topic] = [];
    }

    // 添加事件到缓冲区
    this.eventBuffer[topic].push(event);

    // 检查是否达到批量大小
    if (this.eventBuffer[topic].length >= (config.batchSize || 10)) {
      await this.flushBuffer(topic);
    } else if (config.batchTimeout) {
      // 设置批量发送超时
      if (this.batchTimeouts[topic]) {
        clearTimeout(this.batchTimeouts[topic]);
      }

      this.batchTimeouts[topic] = setTimeout(() => {
        this.flushBuffer(topic);
      }, config.batchTimeout);
    }
  }

  /**
   * 刷新缓冲区中的事件
   * @param topic 主题
   */
  private async flushBuffer(topic: string) {
    // 清除超时
    if (this.batchTimeouts[topic]) {
      clearTimeout(this.batchTimeouts[topic]);
      delete this.batchTimeouts[topic];
    }

    // 发送缓冲区中的所有事件
    const events = this.eventBuffer[topic];
    if (events && events.length > 0) {
      // 创建批量事件
      const batchEvent = {
        eventType: 'batch',
        data: events,
        timestamp: new Date().toISOString(),
      };

      await this.kafkaClient.emit(topic, batchEvent);
      this.eventBuffer[topic] = [];
    }
  }

  /**
   * 刷新所有缓冲区中的事件
   */
  private async flushAllBuffers() {
    // 发送所有缓冲区中的事件
    for (const topic in this.eventBuffer) {
      await this.flushBuffer(topic);
    }
  }
}
