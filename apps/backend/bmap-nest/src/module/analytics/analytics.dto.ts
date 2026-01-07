import { z } from 'zod';

// 定义 Web Vitals 指标的数据结构
export const WebVitalsSchema = z.object({
  name: z.string(), // 指标名称 (FCP, LCP, CLS, INP等)
  value: z.number(), // 指标值
  rating: z.enum(['good', 'needs-improvement', 'poor']), // 指标评级
  id: z.string(), // 唯一标识符
  delta: z.number(), // 与上一次的差值
  entries: z.array(z.any()), // 相关的性能条目
  navigationType: z.string().optional(), // 导航类型
});

export type WebVitalsDTO = z.infer<typeof WebVitalsSchema>;
