/**
 * @description 错误日志实体定义 (MongoDB)
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IResult } from 'ua-parser-js';

@Schema({ timestamps: true, autoIndex: true })
export class ErrorLog extends Document {
  @Prop({ required: true, index: true })
  projectId: string;

  @Prop({ required: true })
  url: string;

  @Prop({ type: Object })
  userAgent: IResult;

  @Prop()
  ip: string;

  @Prop({ type: Object, required: true })
  errorData: {
    message: string;
    stack: string;
    type: 'js_error' | 'resource_error' | 'promise_rejection';
    context?: Record<string, unknown>;
    device?: Record<string, unknown>;
  };

  @Prop({ type: [String], index: true })
  tags: string[];
}

export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog);

// 添加索引优化查询性能
ErrorLogSchema.index({ createdAt: -1 }); // 按时间倒序
ErrorLogSchema.index({ 'errorData.message': 'text' }); // 全文索引错误消息
