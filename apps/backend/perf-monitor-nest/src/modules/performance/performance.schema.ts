import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Performance extends Document {
  @Prop({ required: true })
  pageUrl: string;

  @Prop({ required: true })
  metricType: string; // 如 'load', 'api', 'resource'

  @Prop({ required: true })
  value: number;

  @Prop()
  extra: string; // 额外信息（如 userAgent、traceId 等）
}

export type PerformanceDocument = Performance & Document;
export const PerformanceSchema = SchemaFactory.createForClass(Performance);
