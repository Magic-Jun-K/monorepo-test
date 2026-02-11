import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  nickname: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  email: z.email().optional(),
  phone: z.string().optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
