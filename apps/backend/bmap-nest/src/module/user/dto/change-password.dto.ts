import { z } from 'zod';

// Password strength validation regex
// At least 8 characters, one uppercase, one lowercase, one number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/;

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z
    .string()
    .regex(
      passwordRegex,
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
    ),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export const SetPasswordSchema = z.object({
  newPassword: z
    .string()
    .regex(
      passwordRegex,
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
    ),
});

export type SetPasswordDto = z.infer<typeof SetPasswordSchema>;
