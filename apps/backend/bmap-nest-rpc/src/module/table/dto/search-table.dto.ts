import { z } from 'zod';

// 使用Zod定义验证模式
export const searchTableSchema = z.object({
  userId: z.string().regex(/^\d+$/, { message: '用户ID必须为数字' }).optional(),
  username: z.string().min(2).max(20).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  createTime: z
    .tuple([z.string().datetime(), z.string().datetime()])
    .optional(),
  updateTime: z
    .tuple([z.string().datetime(), z.string().datetime()])
    .optional(),
  amount: z.number().min(0).optional(),
  inventoryQuantity: z.number().min(0).optional(),
  tags: z.string().or(z.array(z.string())).optional(),
  isRecommended: z.boolean().optional(),
  page: z.number().positive(),
  pageSize: z.number().positive().max(100),
});

// 导出类型
export type SearchTableDto = z.infer<typeof searchTableSchema>;
