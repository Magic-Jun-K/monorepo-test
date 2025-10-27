import { z } from 'zod';

export const CreateUserSchema = z.object({
  username: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional().default('ACTIVE'),
  isSuperAdmin: z.boolean().optional().default(false),
  roleIds: z.array(z.number()).optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
