import { z } from 'zod';

export const CreateUserSchema = z.object({
  username: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  userType: z.enum(['user', 'admin']).optional().default('user'),
  isActive: z.boolean().optional().default(true),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
