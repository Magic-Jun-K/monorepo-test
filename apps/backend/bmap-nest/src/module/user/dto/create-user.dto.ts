import { z } from 'zod';

export const CreateUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
