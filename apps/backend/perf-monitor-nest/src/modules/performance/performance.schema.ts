import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface NavigationTiming {
  ttfb: number;
  domContentLoaded: number;
  windowLoad: number;
  resourceCount: number;
}

export interface ResourceTiming {
  type: string;
  name: string;
  duration: number;
}

@Schema({ timestamps: true })
export class Performance extends Document {
  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  env: string;

  @Prop()
  browser: string;

  @Prop()
  pageId: string;

  @Prop()
  fcp: number;

  @Prop()
  lcp: number;

  @Prop()
  cls: number;

  @Prop()
  inp: number;

  @Prop()
  ttfb: number;

  @Prop()
  status: number;

  @Prop({ type: Object })
  navigation: NavigationTiming;

  @Prop({ type: [Object] })
  resources: ResourceTiming[];

  @Prop()
  timestamp: Date;
}

export type PerformanceDocument = Performance & Document;
export const PerformanceSchema = SchemaFactory.createForClass(Performance);
