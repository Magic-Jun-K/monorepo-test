import { z } from '../../core/validator';

export const userSchema = {
  register: z.object({
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
    email: z.string().email(),
    password: z.string().min(8).max(100),
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string(),
  }),

  updateProfile: z.object({
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/)
      .optional(),
    bio: z.string().max(500).optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8).max(100),
  }),
};

export type RegisterInput = z.infer<typeof userSchema.register>;
export type LoginInput = z.infer<typeof userSchema.login>;
export type UpdateProfileInput = z.infer<typeof userSchema.updateProfile>;
export type ChangePasswordInput = z.infer<typeof userSchema.changePassword>;

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
