import { z } from 'zod';

export const ReportPerformanceSchema = z.object({
  type: z.string(),
  page: z.string(),
  value: z.number(),
  timestamp: z.string().datetime(), // 如果你用 zod@3.22.0+，否则用 z.string()
});

// 类型推导
export type ReportPerformanceDto = z.infer<typeof ReportPerformanceSchema>;
