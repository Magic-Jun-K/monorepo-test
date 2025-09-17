/**
 * @description 性能数据 DTO 定义
 */
import { z } from 'zod';

export const PerformanceSchema = z.object({
  project: z.string(), // 项目标识
  url: z.string(), // 页面URL
  fcp: z.number(), // First Contentful Paint
  lcp: z.number(), // Largest Contentful Paint
  fid: z.number(), // First Input Delay
  cls: z.number(), // Cumulative Layout Shift
  ttfb: z.number(), // Time to First Byte
  resources: z.array(
    z.object({
      name: z.string(),
      duration: z.number(),
      size: z.number(),
      type: z.string(),
    }),
  ),
});

// 类型推导（可选）
export type PerformanceDTO = z.infer<typeof PerformanceSchema>;
