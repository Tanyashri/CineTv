import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters long').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  token: z.string().optional(),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters long').optional(),
  avatarUrl: z.string().url('Avatar URL must be a valid URL').nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
