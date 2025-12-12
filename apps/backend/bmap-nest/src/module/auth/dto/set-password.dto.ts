import { z } from 'zod';

export const setPasswordSchema = z
  .object({
    password: z.string().min(6, '密码长度不能少于6位'),
  })
  .refine((data) => data.password !== undefined && data.password !== null && data.password !== '', {
    message: '密码不能为空',
    path: ['password'],
  })
  .refine((data) => typeof data.password === 'string', {
    message: '密码必须是字符串',
    path: ['password'],
  });

export type SetPasswordDto = z.infer<typeof setPasswordSchema>;
