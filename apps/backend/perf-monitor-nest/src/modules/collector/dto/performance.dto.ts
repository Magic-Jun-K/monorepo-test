/**
 * @description 性能数据 DTO 定义
 */
import { z } from 'zod';

export const PerformanceSchema = z.object({
  projectId: z.string(), // 项目标识
  url: z.string(), // 页面URL
  pageId: z.string().optional(), // 页面ID
  env: z.string().optional(), // 环境
  browser: z.string().optional(), // 浏览器
  fcp: z.number().optional(), // First Contentful Paint
  lcp: z.number().optional(), // Largest Contentful Paint
  inp: z.number().optional(), // Interaction to Next Paint
  cls: z.number().optional(), // Cumulative Layout Shift
  ttfb: z.number().optional(), // Time to First Byte
  navigation: z.object({
    ttfb: z.number(),
    domContentLoaded: z.number(),
    windowLoad: z.number(),
    resourceCount: z.number(),
  }).optional(), // Navigation Timing
  resources: z.array(
    z.object({
      name: z.string(),
      duration: z.number(),
      size: z.number().optional(),
      type: z.string(),
    }),
  ).optional(),
});

// 类型推导（可选）
export type PerformanceDTO = z.infer<typeof PerformanceSchema>;
